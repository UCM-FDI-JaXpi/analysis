export function calculateLevelCompletionTimes(groupData) {
    const dataGroup = groupData.actors.map(actor => { // Proceso todos los actores
        let copyStatements = [...actor.statements]; // Hago una copia para que no salte el watch
        const sortedStatements = sortStatements(copyStatements);  // Por cada actor ordenamos sus statements
        const actorData = calculateForStatements(sortedStatements);
        return {
            actorName: actor.name,
            actorData: actorData
        };
    });
    console.log('dataGroup:', dataGroup);
    return dataGroup;
}  

// Extrae la información de los statements de un actor (info para varias graficas)
function calculateForStatements(sortedStatements) {
    let timestamp = 0;
    let starteds = [];
    let completeds = [];
    let result = {
        verbs: {}
    };
    // modelo de resultado 
    //  { 'level1': [ 3,4,5,6]
    //    'level2': [ 3,4,5,6]
    //     . 
    //     . 
    //     . 
    //     verbs : {'v1' : X, 
    //              'V2' : Y, 
    //              .
    //              .
    //             }
    //      starteds: [..]
    //      completeds: [..]
    //  }

    sortedStatements.forEach(statement => {
        // Contar verbos 
        const verbId = statement.verb.id.substring(statement.verb.id.lastIndexOf("/") + 1); // Me quedo solo con lo ultimo (verb)
        if (result.verbs[verbId])
            result.verbs[verbId]++;
        else 
            result.verbs[verbId] = 1;
        /////////////////////////////////////////////////////////////////////
        const objectName = statement.object.definition.name["en-US"];
        if (verbId === "started") {
            if (!result[objectName])
                result[objectName] = []; // Array de un level

            completeds.push({level: 'incompleted'});
            starteds.push({level: objectName});
            timestamp = new Date(statement.timestamp);
        }
         else if (verbId === "completed" && objectName != "Prince of JS") { // No tenemos en cuenta completed game
            if (timestamp != 0) { // Sí está el started
                 result[objectName].push(new Date(statement.timestamp) - timestamp);
                 timestamp = 0; // Lo dejamos a 0 para que espere el nuevo started
                 completeds[completeds.length-1].level = objectName;
            }
        }
    });
    result['starteds'] = starteds;
    result['completeds'] = completeds;
    console.log('result:', result);
    return result;
}

// Recibe un array de statements y los ordena por fecha
export function sortStatements(statements) { 
    const sortedStatements = statements.sort((a, b) => {
        return new Date(a.timestamp) - new Date(b.timestamp);
    });
    return sortedStatements;
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
        return new Date(a.timestamp) - new Date(b.timestamp);
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
