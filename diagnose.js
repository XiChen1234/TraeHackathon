/**
 * 诊断工具 - 检查当前表单状态
 * 点击页面上的"诊断项目输入"按钮运行诊断
 */

/**
 * 执行诊断并在控制台输出结果
 */
function handleDiagnoseClick() {
    console.log('%c=== 时薪计算器诊断报告 ===', 'font-size: 16px; font-weight: bold; color: #3b82f6;');
    console.log(`诊断时间: ${new Date().toLocaleString('zh-CN')}\n`);
    
    // 获取当前表单数据
    const salaryAmount = parseFloat(document.getElementById('salaryAmount').value) || 0;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const breakTime = parseInt(document.getElementById('breakTime').value) || 0;
    const slackOffTime = parseInt(document.getElementById('slackOffTime').value) || 0;
    const commuteTime = parseInt(document.getElementById('commuteTime').value) || 0;
    
    console.log('%c📊 当前表单数据:', 'font-size: 14px; font-weight: bold; color: #1a1a2e;');
    console.table({
        '薪酬金额': salaryAmount ? `${salaryAmount} 元` : '(未填写)',
        '开始时间': startTime,
        '结束时间': endTime,
        '休息时间': `${breakTime} 分钟`,
        '摸鱼时间': `${slackOffTime} 分钟`,
        '通勤时间': `${commuteTime} 分钟`
    });
    
    // 计算总工作时长
    const startParts = startTime.split(':').map(Number);
    const endParts = endTime.split(':').map(Number);
    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];
    
    let totalMinutes;
    if (endMinutes < startMinutes) {
        totalMinutes = (24 * 60 - startMinutes) + endMinutes;
    } else {
        totalMinutes = endMinutes - startMinutes;
    }
    
    const effectiveMinutes = totalMinutes - breakTime - slackOffTime;
    
    console.log('%c⏱️ 工作时长分析:', 'font-size: 14px; font-weight: bold; color: #1a1a2e;');
    console.table({
        '总工作时长': `${totalMinutes} 分钟 (${(totalMinutes/60).toFixed(2)} 小时)`,
        '休息时间': `${breakTime} 分钟`,
        '摸鱼时间': `${slackOffTime} 分钟`,
        '有效工作时长': `${effectiveMinutes} 分钟 (${(effectiveMinutes/60).toFixed(2)} 小时)`
    });
    
    // 诊断问题
    console.log('%c🔍 诊断结果:', 'font-size: 14px; font-weight: bold; color: #1a1a2e;');
    
    const issues = [];
    const warnings = [];
    
    if (salaryAmount <= 0) {
        issues.push('❌ 薪酬金额为0或未填写 - 这会导致计算异常');
    }
    
    if (totalMinutes <= 0) {
        issues.push('❌ 开始时间 >= 结束时间 - 这会触发"时间静止者"成就');
    }
    
    if (effectiveMinutes < 0) {
        issues.push('❌ 休息+摸鱼时间超过总工作时长 - 这会触发特殊成就');
    } else if (effectiveMinutes === 0) {
        warnings.push('⚠️ 有效工作时长为0 - 这会触发"时间静止者"成就');
    } else if (breakTime >= totalMinutes) {
        warnings.push('⚠️ 休息时间 >= 总工作时长 - 这会触发"全职休息家"成就');
    } else if (slackOffTime >= totalMinutes) {
        warnings.push('⚠️ 摸鱼时间 >= 总工作时长 - 这会触发"摸鱼仙人"成就');
    } else {
        console.log('✅ 时间设置正常，不会触发特殊成就');
    }
    
    if (issues.length > 0) {
        console.group('❌ 问题');
        issues.forEach(issue => console.log(issue));
        console.groupEnd();
    }
    
    if (warnings.length > 0) {
        console.group('⚠️ 警告');
        warnings.forEach(warning => console.log(warning));
        console.groupEnd();
    }
    
    // 结论
    console.log('%c📋 结论:', 'font-size: 14px; font-weight: bold; color: #1a1a2e;');
    if (salaryAmount > 0 && effectiveMinutes > 0) {
        console.log('%c✅ 所有设置正常，可以正常计算时薪', 'color: #34c759; font-weight: bold; font-size: 13px;');
        console.log('%c   如果仍然显示无穷大，请检查浏览器控制台是否有错误', 'color: #6b7280; font-size: 12px;');
    } else if (salaryAmount > 0 && effectiveMinutes <= 0) {
        console.log('%c⚠️ 薪资已填写，但时间设置有误', 'color: #ffd60a; font-weight: bold; font-size: 13px;');
        console.log('%c   请检查上方问题并修改时间设置', 'color: #6b7280; font-size: 12px;');
    } else {
        console.log('%c❌ 请填写薪资和时间相关信息', 'color: #ff453a; font-weight: bold; font-size: 13px;');
    }
    
    console.log('\n%c=== 诊断结束 ===', 'font-size: 12px; color: #9ca3af;');
}

// 绑定诊断按钮事件
document.addEventListener('DOMContentLoaded', () => {
    const diagnoseButton = document.getElementById('diagnoseButton');
    if (diagnoseButton) {
        diagnoseButton.addEventListener('click', handleDiagnoseClick);
    }
});

// 导出函数供外部使用
window.diagnoseCalculator = {
    run: handleDiagnoseClick
};
