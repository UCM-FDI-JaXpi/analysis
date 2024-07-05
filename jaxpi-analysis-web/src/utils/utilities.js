export function calculateLevelCompletionTimes(jsonData) {
    let timestamp;
    let arrayFlagsStarted = []; // Para controlar si hubo un started antes de ciertos verbos
    let arrayFlagsCompleted = []; // Para controlar si hubo un completed antes de ciertos verbos
    let arrayTimes = []; // Para hacer operaciones auxiliares
    let arrayTimesLoad = []; // Para guardar los tiempos de las partidas guardadas
    let arrayFinalTimes = [];

    const sortedEvents = jsonData.sort((a, b) => {
        return new Date(a.timestamp.$date) - new Date(b.timestamp.$date);
    });

    sortedEvents.forEach(event => {
        const verbId = event.verb.id.substring(event.verb.id.lastIndexOf("/") + 1); // Me quedo solo con lo ultimo, el verb
        const objectName = event.object.definition.name["en-US"];

        if (verbId === "started") {
            arrayFlagsStarted[objectName] = true;
            arrayFlagsCompleted[objectName] = false;
            timestamp = new Date(event.timestamp.$date);
            arrayTimes[objectName] = 0;
        } else if (verbId === "exited") {
            if (arrayFlagsStarted[objectName]) // Guardar el tiempo entre started/loaded -> exited
                arrayTimes[objectName] += new Date(event.timestamp.$date) - timestamp;
        } else if (verbId === "loaded") {
            if (arrayFlagsStarted[objectName]) {
                timestamp = new Date(event.timestamp.$date);
                // Si nunca existió este load, guardo el tiempo hasta el punto guardado, si ya existia, mantengo ese tiempo
                if(arrayTimesLoad[event.object.definition.extensions["https://github.com/UCM-FDI-JaXpi/lib/id_load"]] === 0){ 
                    // Guardar el tiempo desde el started hasta el punto de guardado
                    arrayTimesLoad[event.object.definition.extensions["https://github.com/UCM-FDI-JaXpi/lib/id_load"]] = arrayTimes[objectName]
                }
            } else if (arrayFlagsCompleted[objectName]) {
                arrayTimes[objectName] = arrayTimesLoad[event.object.definition.extensions["https://github.com/UCM-FDI-JaXpi/lib/id_load"]];
                arrayFlagsCompleted[objectName] = false;
            }
        } else if (verbId === "completed") {
            if (arrayFlagsStarted[objectName]) {
                arrayTimes[objectName] += new Date(event.timestamp.$date) - timestamp;
                arrayFlagsCompleted[objectName] = true;
                arrayFlagsStarted[objectName] = false;

                if (arrayFinalTimes[objectName]) {
                    // Como se puede completar varias veces un mismo nivel, elegimos el de menor tiempo
                    if (arrayTimes[objectName] < arrayFinalTimes[objectName])
                        arrayFinalTimes[objectName] = arrayTimes[objectName];
                } else {
                    arrayFinalTimes[objectName] = arrayTimes[objectName];
                }
                arrayTimes[objectName] = 0;
            }
        } else if (verbId === "overloaded"){
             // Guardar el tiempo desde el started hasta el nuevo punto de guardado con el overloaded ya que pisamos el anterior punto de guardado
             arrayTimesLoad[event.object.definition.extensions["https://github.com/UCM-FDI-JaXpi/lib/id_load"]] = arrayTimes[objectName]
        }
    });

    return Object.keys(arrayFinalTimes).map(level => ({
        nameObject: level,
        completionTime: arrayFinalTimes[level]
    }));
}

export function calculateAttemptsPerLevel(jsonData) {
    let attemptsObject = {};
    let arrayFlagsStarted = [];
    const failedAttempts = new Proxy([], {
        get: function (target, prop) {
            if (!(prop in target)) {
                target[prop] = 0; // Si la posición no está definida, se inicializa a cero
            }
            return target[prop];
        }
    });
    const successedAttempts = new Proxy([], {
        get: function (target, prop) {
            if (!(prop in target)) {
                target[prop] = 0;
            }
            return target[prop];
        }
    });

    // Extraer los objetos del array Proxy
    const realObjects = jsonData.map(proxy => { return proxy });
    const sortedEvents = realObjects.sort((a, b) => {
        return new Date(a.timestamp.$date) - new Date(b.timestamp.$date);
    });

    sortedEvents.forEach(event => {
        const verbId = event.verb.id.substring(event.verb.id.lastIndexOf("/") + 1); // Me quedo solo con verb
        const objectName = event.object.definition.name["en-US"];

        if (verbId === "started") {
            failedAttempts[objectName]++;
            arrayFlagsStarted[objectName] = true;
        } else if (verbId === "completed" && arrayFlagsStarted[objectName]) {
            successedAttempts[objectName]++;
            arrayFlagsStarted[objectName] = false;
            failedAttempts[objectName]--;
        }
    });

    attemptsObject = Object.keys(successedAttempts).map(level => ({
        nameObject: level,
        successedAttempts: successedAttempts[level],
        failedAttempts: failedAttempts[level]
    }));

    // Añade las posiciones de failedAttempts que no están en successedAttempts
    Object.keys(failedAttempts)
        .filter(level => !successedAttempts.hasOwnProperty.call(successedAttempts, level))
        .forEach(level => {
            attemptsObject.push({
                nameObject: level,
                successedAttempts: 0,
                failedAttempts: failedAttempts[level]
            });
        });

    // Sort attemptsObject by nameObject
    attemptsObject = attemptsObject.sort((a, b) => {
        if (a.nameObject < b.nameObject)
            return -1;
        if (a.nameObject > b.nameObject)
            return 1;
        return 0;
    });

    return attemptsObject;
}

// Unused function yet, to calculate score/level or score/session or score/day
export function calculateScorePerLevel(jsonData) { //Para un completed level
    let scorePerLevel = {};

    // Procesar los datos para calcular el puntaje por nivel
    jsonData.forEach(event => {
        const objectName = event.object.definition.name["en-US"]; // Level X
        const verbId = event.verb.id.substring(event.verb.id.lastIndexOf("/") + 1); // completed para coger el score
        let score;
        if(verbId === "completed"){
            score = event.score;
        }
        if (score && objectName) {
            if (!scorePerLevel[objectName]) {
                scorePerLevel[objectName] = {
                    bestScore: Number.MIN_SAFE_INTEGER,
                    worstScore: Number.MAX_SAFE_INTEGER
                };
            }
            
            if (score > scorePerLevel[objectName].bestScore) {
                scorePerLevel[objectName].bestScore = score;
            }
            if (score < scorePerLevel[objectName].worstScore) {
                scorePerLevel[objectName].worstScore = score;
            }
        }
    });

    // Formatear los datos para las gráficas
    return Object.keys(scorePerLevel).map(level => ({
        nameObject: level,
        bestScore: scorePerLevel[level].bestScore,
        worstScore: scorePerLevel[level].worstScore
    }));
}
