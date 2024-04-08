export function calculateLevelCompletionTimes(jsonData) {
    const levelCompletionTimes = {};

    // Sort by timestamp
    const sortedEvents = jsonData.sort((a, b) => {
        return new Date(a.timestamp.$date) - new Date(b.timestamp.$date);
    });

    sortedEvents.forEach(event => {
        const verbId = event.verb.id;
        const objectId = event.object.id;
        const objectDefinition = event.object.definition;
        const timestamp = new Date(event.timestamp.$date).toISOString();
        const levelName = objectDefinition.name["en-us"];
        const levelIdentifier = objectId + "_" + levelName.replace(/\s/g, ''); // .../level_Level1 remove spaces

        if (verbId === "https://github.com/UCM-FDI-JaXpi/lib/started") {
            levelCompletionTimes[levelIdentifier] = { started: timestamp };
        } else if (verbId === "https://github.com/UCM-FDI-JaXpi/lib/completed" &&
            levelCompletionTimes[levelIdentifier]) {
            levelCompletionTimes[levelIdentifier].completed = timestamp;
            const startedTime = levelCompletionTimes[levelIdentifier].started;
            const completedTime = timestamp;
            const completionTime = new Date(completedTime) - new Date(startedTime); // ms
            levelCompletionTimes[levelIdentifier].completionTime = changeTimeFormat(completionTime);
        }
    });
    return levelCompletionTimes;
}

// Convert milliseconds to hours:minutes:seconds format
function changeTimeFormat(ms) {
    const hours = Math.floor(ms / 3600000); // 1 h = 3600000 ms
    const minutes = Math.floor((ms % 3600000) / 60000); // 1 min = 60000 ms
    const seconds = Math.floor((ms % 60000) / 1000); // 1 s = 1000 ms

    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return formattedTime;
}
