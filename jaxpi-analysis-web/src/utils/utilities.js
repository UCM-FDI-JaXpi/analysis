export function calculateLevelCompletionTimes(groupData) {
    const dataGroup = groupData.actors.map(actor => { // Proceso todos los actores
        let copyStatements = [...actor.statements]; // Hago una copia para que no salte el watch
        const sortedStatements = sortStatements(copyStatements);  // Por cada actor ordenamos sus statements
        const actorData = calculateForStatements(sortedStatements);
        return {
            sessionId: actor.sessionId,
            actorName: actor.name,
            actorData: actorData
        };
    });
    console.log('dataGroup:', dataGroup);
    return dataGroup;
}  

// Extrae la información de los statements de un actor (info para varias graficas)
export function calculateForStatements(sortedStatements) {
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
    //      countCompletedLevel: [...]
    //      interactions: [ { object: 'fighter', count: X} ...]
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
            if (timestamp != 0) { // Si está el started
                if (result[objectName]){
                    result[objectName].push(new Date(statement.timestamp) - timestamp);
                    timestamp = 0; // Lo dejamos a 0 para que espere el nuevo started
                    completeds[completeds.length-1].level = objectName;
                } 
            }
        }
    });
    
    // Calcula cuantas veces se ha completado cada nivel
    let res = [];
    const keys = Object.keys(result).filter(key => key.includes('level') && key != 'level 15');
    if (keys) { // [ 'level1','level2', ...]
        keys.forEach(key => {
            if (result[key].length > 0)
                res.push(result[key].length);
        }); 
    }

    // Calcula las interaccciones con los objetos del juego
    let interactionsTempo = []
    sortedStatements.forEach(statement => {
        // Contar verbos 
        const verbId = statement.verb.id.substring(statement.verb.id.lastIndexOf("/") + 1); // Me quedo solo con lo ultimo (verb)
        if(verbId != 'started' && verbId != 'completed' && verbId !='jumped' && verbId !='died'){
            const obj = interactionsTempo.find(e => e.object == statement.object.definition.name["en-US"]);
            if (obj){
                obj.count++;
            } else {
                let data = {
                    object: statement.object.definition.name["en-US"],
                    count: 1
                }
                interactionsTempo.push(data);
            }
        }
    });

    result['starteds'] = starteds;
    result['completeds'] = completeds;
    result['countCompletedLevel'] = res;
    result['interactions'] = interactionsTempo;

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