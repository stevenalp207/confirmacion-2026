import fs from 'fs';

const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

const groupsOrdered = ["Fortaleza", "Piedad", "Sabiduria", "Ciencia", "Entendimiento", "Consejo", "Temor"];
let allParticipants = [];
const seen = new Set();

groupsOrdered.forEach((groupName, rank) => {
    data[groupName].forEach(name => {
        if (!seen.has(name)) {
            allParticipants.push({ name, rank: rank + 1 });
            seen.add(name);
        }
    });
});

const conflicts = [
    ["Stacey Soto", "Ismael Astorga"],
    ["Amanda Ramírez", "Lemuel Arrieta"],
    ["Alejandro Siles", "Abigail"],
    ["Monserrat Gomez", "Sebastián Peraza"],
    ["Christopher Castro", "Angelo Ortiz"],
    ["Daniel del Valle", "Derek"],
    ["Daniel del Valle", "Angelo Ortiz"]
];

const conflictiveStrong = ["Derek", "Laura Forbes", "Fiorella Sequeira"];
const rowdy = ["Terry", "Derek", "Sebastián Lara", "Fabricio morales", "Angelo Ortiz", "Roy Madrigal", "Sebastián Peraza", "Nacho", "Christopher Castro"];

function calculatePenalty(subgroups) {
    let penalty = 0;
    subgroups.forEach(group => {
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                if (conflicts.some(pair => (pair[0] === group[i].name && pair[1] === group[j].name) || (pair[1] === group[i].name && pair[0] === group[j].name))) {
                    penalty += 1000;
                }
            }
        }
        const countStrong = group.filter(p => conflictiveStrong.includes(p.name)).length;
        if (countStrong > 1) penalty += (countStrong - 1) * 500;

        const countRowdy = group.filter(p => rowdy.includes(p.name)).length;
        if (countRowdy > 2) penalty += (countRowdy - 2) * 300;
    });
    return penalty;
}

allParticipants.sort((a, b) => a.rank - b.rank);
let subgroups = Array.from({ length: 7 }, () => []);
allParticipants.forEach((p, idx) => {
    const groupIdx = Math.floor(idx / 7);
    const subIdx = groupIdx % 2 === 0 ? (idx % 7) : (6 - (idx % 7));
    subgroups[subIdx].push(p);
});

let currentPenalty = calculatePenalty(subgroups);

for (let iter = 0; iter < 20000; iter++) {
    const g1 = Math.floor(Math.random() * 7);
    const g2 = Math.floor(Math.random() * 7);
    if (g1 === g2) continue;

    const i1 = Math.floor(Math.random() * subgroups[g1].length);
    const i2 = Math.floor(Math.random() * subgroups[g2].length);

    const p1 = subgroups[g1][i1];
    const p2 = subgroups[g2][i2];

    subgroups[g1][i1] = p2;
    subgroups[g2][i2] = p1;

    const newPenalty = calculatePenalty(subgroups);
    if (newPenalty <= currentPenalty) {
        currentPenalty = newPenalty;
    } else {
        subgroups[g1][i1] = p1;
        subgroups[g2][i2] = p2;
    }
}

console.log('Penalidad final: ' + currentPenalty);
subgroups.forEach((group, idx) => {
    console.log('Grupo ' + (idx + 1));
    group.forEach(p => console.log(p.name));
});
