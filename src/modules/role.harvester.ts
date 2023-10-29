/**
 * 矿工配置生成器
 * source: 从指定矿中挖矿
 * target: 将其转移到指定的 roomController 中
 * 
 * @param sourceId 要挖的矿 id
 * @param targetId 
 */
export default (sourceId, targetId) => ({
    // 采集能量矿
    /**
     * 
     * @param {Creep} creep 
     * @returns {boolean} 
     */
    source: creep => {
        const source = Game.getObjectById(sourceId)
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) creep.moveTo(source)

        // 自己身上的能量装满了，返回 true（切换至 target 阶段）
        return creep.store.getFreeCapacity() <= 0
    },
    // 存放能量
    target: creep => {
        const target = Game.getObjectById(targetId)
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) creep.moveTo(target)

        // 自己身上的能量没有了，返回 true（切换至 source 阶段）
        return creep.store[RESOURCE_ENERGY] <= 0
    }
})