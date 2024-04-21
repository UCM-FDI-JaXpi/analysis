export function calculateLevelCompletionTimes(jsonData) {
    let timestamp;
    let arrayFlagsStarted = [];
    let arrayFlagsCompleted = [];
    let arrayTimes = [];
    let arrayTimesLoad = [];
    let arrayFinalTimes = [];

    const sortedEvents = jsonData.sort((a, b) => {
        return new Date(a.timestamp.$date) - new Date(b.timestamp.$date);
    });

    sortedEvents.forEach(event => {
        const verbId = event.verb.id;
        const objectName = event.object.definition.name["en-us"];

        if (verbId === "https://github.com/UCM-FDI-JaXpi/lib/started") {
            arrayFlagsStarted[objectName] = true;
            arrayFlagsCompleted[objectName] = false;
            timestamp = new Date(event.timestamp.$date);
            arrayTimes[objectName] = 0;
        } else if (verbId === "https://github.com/UCM-FDI-JaXpi/lib/exited") {
            if (arrayFlagsStarted[objectName])
                arrayTimes[objectName] += new Date(event.timestamp.$date) - timestamp;
        } else if (verbId === "https://github.com/UCM-FDI-JaXpi/lib/loaded") {
            if (arrayFlagsStarted[objectName]) {
                timestamp = new Date(event.timestamp.$date);
                arrayTimesLoad[event.object.definition.extensions["https://github.com/UCM-FDI-JaXpi/id_load"]] = arrayTimes[objectName]
            } else if (arrayFlagsCompleted[objectName]) {
                arrayTimes[objectName] = arrayTimesLoad[event.object.definition.extensions["https://github.com/UCM-FDI-JaXpi/id_load"]];
                arrayFlagsCompleted[objectName] = false;
            }
        } else if (verbId === "https://github.com/UCM-FDI-JaXpi/lib/completed") {
            if (arrayFlagsStarted[objectName]) {
                arrayTimes[objectName] += new Date(event.timestamp.$date) - timestamp;
                arrayFlagsCompleted[objectName] = true;
                arrayFlagsStarted[objectName] = false;

                if (arrayFinalTimes[objectName]) {
                    if (arrayTimes[objectName] < arrayFinalTimes[objectName])
                        arrayFinalTimes[objectName] = arrayTimes[objectName];
                } else {
                    arrayFinalTimes[objectName] = arrayTimes[objectName];
                }
                arrayTimes[objectName] = 0;
            }
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
        const verbId = event.verb.id;
        const objectName = event.object.definition.name["en-us"];

        if (verbId === "https://github.com/UCM-FDI-JaXpi/lib/started") {
            failedAttempts[objectName]++;
            arrayFlagsStarted[objectName] = true;
        } else if (verbId === "https://github.com/UCM-FDI-JaXpi/lib/completed" && arrayFlagsStarted[objectName]) {
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
    return attemptsObject;
}