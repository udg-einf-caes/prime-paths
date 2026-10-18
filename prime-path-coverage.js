const fs = require('fs');

function readGraphFromFile(src) {
    const content = fs.readFileSync(src, 'utf-8');
    // Separem per línies netejant espais buits
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    
    let nodes = [];
    let initNodes = [];
    let endNodes = [];
    let lineIdx = 0;

    // Busquem i processem les línies de configuració inicials
    while (lineIdx < lines.length) {
        const currentLine = lines[lineIdx];
        
        if (currentLine.startsWith("Nodes:")) {
            nodes = currentLine.replace("Nodes:", "").trim().split(/\s+/).map(Number);
            lineIdx++;
        } else if (currentLine.startsWith("Nodes inicials:")) {
            initNodes = currentLine.replace("Nodes inicials:", "").trim().split(/\s+/).map(Number);
            lineIdx++;
        } else if (currentLine.startsWith("Nodes finals:")) {
            endNodes = currentLine.replace("Nodes finals:", "").trim().split(/\s+/).map(Number);
            lineIdx++;
            break; // Un cop llegits els nodes finals, la resta són arestes
        } else {
            // Si trobem un format inesperat abans d'hora
            throw new Error(`Format de fitxer incorrecte a la línia ${lineIdx + 1}: es buscaven les etiquetes de configuració.`);
        }
    }

    // Validacions de seguretat bàsiques
    if (nodes.length === 0) throw new Error("Format de fitxer incorrecte: falten els nodes.");
    if (initNodes.length === 0) throw new Error("Format de fitxer incorrecte: falten els nodes inicials.");
    if (endNodes.length === 0) throw new Error("Format de fitxer incorrecte: falten els nodes finals.");

    // Creem un Set de nodes per fer validacions ràpides i eficients
    const nodesSet = new Set(nodes);

    // Inicialitzem l'objecte d'arestes buit per a cada node existent
    const edges = {};
    for (const n of nodes) {
        edges[n] = [];
    }

    // 4. Llegir arestes (tuples origen destí a cada línia restant)
    while (lineIdx < lines.length) {
        const currentLine = lines[lineIdx++];
        const tokens = currentLine.split(/\s+/);
        
        // Validació 1: Controlar que hi hagi exactament 2 números
        if (tokens.length !== 2 || tokens[0] === "" || tokens[1] === "") {
            console.warn(`[ERROR LÍNIA ${lineIdx}]: S'esperaven 2 números (origen destí), s'ha trobat: "${currentLine}". Línia descartada.`);
            continue;
        }

        const origin = Number(tokens[0]);
        const dest = Number(tokens[1]);

        // Validació 2: Comprovar que els números siguin realment vàlids
        if (isNaN(origin) || !nodesSet.has(origin)) {
            console.warn(`[ERROR LÍNIA ${lineIdx}]: El node origen (${tokens[0]}) no existeix al llistat de nodes. Línia descartada.`);
            continue;
        }
        if (isNaN(dest) || !nodesSet.has(dest)) {
            console.warn(`[ERROR LÍNIA ${lineIdx}]: El node destí (${tokens[1]}) no existeix al llistat de nodes. Línia descartada.`);
            continue;
        }

        // Si tot és correcte, afegim l'aresta
        edges[origin].push(dest);
    }

    return { nodes, init: initNodes, end: endNodes, edges };
}

function reachHead(pathArr, graph) {
    if (pathArr.length === 0) return true;
    const head = pathArr[0];
    
    const former_nodes = graph.nodes.filter(n => (graph.edges[n] || []).includes(head));
    
    for (const n of former_nodes) {
        if (!pathArr.includes(n) || n === pathArr[pathArr.length - 1]) {
            return false;
        }
    }
    return true;
}

function reachEnd(pathArr, graph) {
    if (pathArr.length === 0) return true;
    const tail = pathArr[pathArr.length - 1];
    const later_nodes = graph.edges[tail] || [];
    
    for (const n of later_nodes) {
        if (!pathArr.includes(n) || n === pathArr[0]) {
            return false;
        }
    }
    return true;
}

function isPrimePath(pathArr, graph) {
    if (pathArr.length >= 2 && pathArr[0] === pathArr[pathArr.length - 1]) {
        return true;
    } else if (reachHead(pathArr, graph) && reachEnd(pathArr, graph)) {
        return true;
    } else {
        return false;
    }
}

function extendable(pathArr, graph) {
    if (isPrimePath(pathArr, graph) || reachEnd(pathArr, graph)) {
        return false;
    } else {
        return true;
    }
}

function findSimplePath(graph, exPaths, paths = []) {
    paths.push(...exPaths.filter(p => isPrimePath(p, graph)));
    exPaths = exPaths.filter(p => extendable(p, graph));
    
    const newExPaths = [];
    for (const p of exPaths) {
        const lastNode = p[p.length - 1];
        const nextNodes = graph.edges[lastNode] || [];
        for (const nx of nextNodes) {
            if (!p.includes(nx) || nx === p[0]) {
                newExPaths.push([...p, nx]);
            }
        }
    }
    
    if (newExPaths.length > 0) {
        findSimplePath(graph, newExPaths, paths);
    }
}

function findPrimePaths(graph) {
    const exPaths = graph.nodes.map(n => [n]);
    const simplePaths = [];
    
    findSimplePath(graph, exPaths, simplePaths);
    
    const primePaths = simplePaths.sort((a, b) => {
        if (a.length !== b.length) {
            return a.length - b.length;
        }
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return a[i] - b[i];
            }
        }
        return 0;
    });
    
    console.log(`\nQuantitat total de prime-paths: ${primePaths.length}`);
    for (const p of primePaths) {
        console.log(`[ ${p.join(', ')} ]`);
    }
}

function usage() {
    console.log("Cercant els prime-paths.");
    console.log("Ús: node prime-path-coverage.js GRAF");
}

function main() {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.error("Error d'arguments!");
        usage();
        process.exit(-1);
    }
    
    const graphFile = args[0];
    if (!fs.existsSync(graphFile)) {
        console.error(`Error: El fitxer '${graphFile}' no existeix.`);
        process.exit(-1);
    }
    
    try {
        const graph = readGraphFromFile(graphFile);
        findPrimePaths(graph);
    } catch (err) {
        console.error("Error en processar el graf:", err.message);
    }
}

main();
