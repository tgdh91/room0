import { creepConfigs } from "@/creepConfig"


export function mountSpawn() {
    _.assign(StructureSpawn.prototype, spawnExtension)
}


const spawnExtension = {
    // 添加 work 方法
    work() {
        // 自己已经在生成了 / 内存里没有生成队列 / 生产队列为空 就啥都不干
        if (this.spawning || !this.room.memory.spawnList || this.room.memory.spawnList.length == 0) {
            //console.log('没有')
            return }
        // 进行生成
        //console.log(this.room.memory.spawnList[0])
        const spawnSuccess = this.mainSpawn(this.room.memory.spawnList[0])
        //console.log('spawnCreep success')
        // 生成成功后移除任务
        if (spawnSuccess) this.room.memory.spawnList.shift()
    },
    mainSpawn(configName: string) {
        let creepName = configName+'_'+Game.time
        if(this.spawnCreep(creepConfigs[configName].body, creepName, { memory: { configName: configName }}) == 0) {
            console.log(`生成Creep: ${creepName}, body: ${creepConfigs[configName].body}`)
            return true
        }
    }
}


