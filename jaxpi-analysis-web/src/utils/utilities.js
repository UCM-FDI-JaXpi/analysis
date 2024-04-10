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
        const objectDefinitionName = event.object.definition.name["en-us"];

        if (verbId === "https://github.com/UCM-FDI-JaXpi/lib/started") {
            arrayFlagsStarted[objectDefinitionName] = true;
            arrayFlagsCompleted[objectDefinitionName] = false;
            timestamp = new Date(event.timestamp.$date);
            arrayTimes[objectDefinitionName] = 0;
        } else if (verbId === "https://github.com/UCM-FDI-JaXpi/lib/exited") {
            if (arrayFlagsStarted[objectDefinitionName])
                arrayTimes[objectDefinitionName] += new Date(event.timestamp.$date) - timestamp;
        } else if (verbId === "https://github.com/UCM-FDI-JaXpi/lib/loaded") {
            if (arrayFlagsStarted[objectDefinitionName]) {
                timestamp = new Date(event.timestamp.$date);
                arrayTimesLoad[event.object.definition.extensions["https://github.com/UCM-FDI-JaXpi/id_load"]] = arrayTimes[objectDefinitionName]
            } else if (arrayFlagsCompleted[objectDefinitionName]) {
                arrayTimes[objectDefinitionName] = arrayTimesLoad[event.object.definition.extensions["https://github.com/UCM-FDI-JaXpi/id_load"]];
                arrayFlagsCompleted[objectDefinitionName] = false;
            }
        } else if (verbId === "https://github.com/UCM-FDI-JaXpi/lib/completed") {
            if (arrayFlagsStarted[objectDefinitionName]) {
                arrayTimes[objectDefinitionName] += new Date(event.timestamp.$date) - timestamp;
                arrayFlagsCompleted[objectDefinitionName] = true;
                arrayFlagsStarted[objectDefinitionName] = false;

                if (arrayFinalTimes[objectDefinitionName]) {
                    if (arrayTimes[objectDefinitionName] < arrayFinalTimes[objectDefinitionName])
                        arrayFinalTimes[objectDefinitionName] = arrayTimes[objectDefinitionName];
                } else {
                    arrayFinalTimes[objectDefinitionName] = arrayTimes[objectDefinitionName];
                }
                arrayTimes[objectDefinitionName] = 0;
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

    const sortedEvents = jsonData.sort((a, b) => {
        return new Date(a.timestamp.$date) - new Date(b.timestamp.$date);
    });

    sortedEvents.forEach(event => {
        const verbId = event.verb.id;
        const objectName = event.object.definition.name["en-us"];

        if (verbId === "https://github.com/UCM-FDI-JaXpi/lib/started") {
            if (arrayFlagsStarted[objectName]) {
                failedAttempts[objectName]++;
            }
            arrayFlagsStarted[objectName] = true;
        } else if (verbId === "https://github.com/UCM-FDI-JaXpi/lib/completed" && arrayFlagsStarted[objectName]) {
            successedAttempts[objectName]++;
            arrayFlagsStarted[objectName] = false;
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

// Convert milliseconds to hours:minutes:seconds format
/*function changeTimeFormat(ms) {
    const hours = Math.floor(ms / 3600000); // 1 h = 3600000 ms
    const minutes = Math.floor((ms % 3600000) / 60000); // 1 min = 60000 ms
    const seconds = Math.floor((ms % 60000) / 1000); // 1 s = 1000 ms
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return formattedTime;
}*/