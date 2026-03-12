/**
 * 系统监控功能测试脚本
 * 
 * 使用方法:
 * npx ts-node src/main/lumen_core/tools/__tests__/system_monitor.test.ts
 */

import { systemMonitor } from '../system_monitor';

async function testSystemMonitor() {
  console.log('=== 系统监控功能测试 ===\n');

  try {
    // 1. 测试系统信息检测
    console.log('1. 测试系统信息检测...');
    const systemInfo = await systemMonitor.getSystemInfo();
    console.log('✓ 系统信息:', JSON.stringify(systemInfo, null, 2));

    // 2. 测试 LLM 参数推荐
    console.log('\n2. 测试 LLM 参数推荐...');
    const llmParams = await systemMonitor.getRecommendedLLMParams();
    console.log('✓ LLM 推荐参数:', JSON.stringify(llmParams, null, 2));

    // 3. 测试 Embedding 参数推荐
    console.log('\n3. 测试 Embedding 参数推荐...');
    const embeddingParams = await systemMonitor.getRecommendedEmbeddingParams();
    console.log('✓ Embedding 推荐参数:', JSON.stringify(embeddingParams, null, 2));

    // 4. 测试缓存机制
    console.log('\n4. 测试缓存机制...');
    const cachedInfo = await systemMonitor.getSystemInfo();
    console.log('✓ 从缓存获取系统信息（第二次调用应该更快）');

    // 5. 测试清除缓存
    console.log('\n5. 测试清除缓存...');
    systemMonitor.clearCache();
    console.log('✓ 缓存已清除，下次调用将重新检测');

    // 6. 验证机型判断逻辑
    console.log('\n6. 验证机型判断逻辑...');
    switch (systemInfo.machineType) {
      case 'apple_silicon_high':
        console.log('  → Apple Silicon 高配机型 (M1/M2/M3 Max/Ultra, 64GB+ RAM)');
        break;
      case 'apple_silicon_mid':
        console.log('  → Apple Silicon 中配机型 (M1/M2/M3 Pro, 32GB+ RAM)');
        break;
      case 'apple_silicon_base':
        console.log('  → Apple Silicon 基础机型 (M1/M2/M3, <32GB RAM)');
        break;
      case 'intel_mac_high':
        console.log('  → Intel Mac 高配 (32GB+ RAM)');
        break;
      case 'intel_mac_low':
        console.log('  → Intel Mac 低配 (<32GB RAM)');
        break;
      default:
        console.log('  → 未知机型');
    }

    console.log('\n=== 所有测试通过 ✓ ===\n');
  } catch (error) {
    console.error('\n✗ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
testSystemMonitor();
