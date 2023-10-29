interface Creep {
    work: () => void
}

interface Memory {
    creepConfigs: {},
    spwantTask: {}
}

interface StructureSpawn {
    work(),
    mainSpawn(configName: string)
}

interface RoomMemory{
    spawnList: []
}

