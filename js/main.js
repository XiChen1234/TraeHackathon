/**
 * 时薪计算器 - 主入口模块
 * 整合所有模块，处理用户交互
 */

import {
    calculateHourlyWage,
    SALARY_UNIT_CONFIG
} from './calculator.js';

import {
    renderAchievementCard,
    renderFunComparisons,
    renderUnlockedAchievements,
    renderCalculationProcess,
    renderSliderValue,
    initStarRating,
    renderSalaryUnit,
    renderCustomDaysInput,
    renderRatingLabel,
    clearResult,
    showLoading,
    scrollToResult
} from './renderer.js';

// 应用状态
const appState = {
    input: {
        salaryType: 'monthly',
        salaryAmount: null,
        workDaysType: 'doubleRest',
        customWorkDays: 21.75,
        startTime: '09:00',
        endTime: '18:00',
        breakTime: 60,
        slackOffTime: 30,
        commuteTime: 60,
        monthlyRent: 0,
        dailyMealCost: 50,
        kpiLevel: 'B',
        atmosphereRating: 3,
        colleagueRating: 3,
        workspaceRating: 3
    },
    result: null
};

/**
 * 获取表单输入数据
 * @returns {Object} 用户输入数据
 */
function getFormData() {
    const salaryAmount = parseFloat(document.getElementById('salaryAmount').value);
    const customWorkDays = parseFloat(document.getElementById('customWorkDays').value);

    return {
        salaryType: document.getElementById('salaryType').value,
        salaryAmount: isNaN(salaryAmount) ? 0 : salaryAmount,
        workDaysType: document.getElementById('workDaysType').value,
        customWorkDays: isNaN(customWorkDays) ? 21.75 : customWorkDays,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        breakTime: parseInt(document.getElementById('breakTime').value) || 0,
        slackOffTime: parseInt(document.getElementById('slackOffTime').value) || 0,
        commuteTime: parseInt(document.getElementById('commuteTime').value) || 0,
        monthlyRent: parseFloat(document.getElementById('monthlyRent').value) || 0,
        dailyMealCost: parseFloat(document.getElementById('dailyMealCost').value) || 0,
        kpiLevel: document.getElementById('kpiLevel').value,
        atmosphereRating: appState.input.atmosphereRating,
        colleagueRating: appState.input.colleagueRating,
        workspaceRating: appState.input.workspaceRating
    };
}

/**
 * 验证表单数据
 * @param {Object} data - 表单数据
 * @returns {Object} 验证结果
 */
function validateFormData(data) {
    const errors = [];

    if (!data.salaryAmount || data.salaryAmount <= 0) {
        errors.push('请输入有效的薪酬金额');
    }

    const salaryConfig = SALARY_UNIT_CONFIG[data.salaryType];
    if (data.salaryAmount > salaryConfig.max) {
        errors.push(`${salaryConfig.unit}不能超过${salaryConfig.max}元`);
    }

    if (data.workDaysType === 'custom') {
        if (isNaN(data.customWorkDays) || data.customWorkDays < 0 || data.customWorkDays > 31) {
            errors.push('请输入0-31之间的自定义天数');
        }
    }

    const startParts = data.startTime.split(':').map(Number);
    const endParts = data.endTime.split(':').map(Number);
    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];
    let totalMinutes;
    if (endMinutes < startMinutes) {
        totalMinutes = (24 * 60 - startMinutes) + endMinutes;
    } else {
        totalMinutes = endMinutes - startMinutes;
    }

    if (totalMinutes <= 0) {
        errors.push('结束时间必须晚于开始时间');
    }

    const breakTime = data.breakTime || 0;
    const slackTime = data.slackOffTime || 0;
    const effectiveMinutes = totalMinutes - breakTime - slackTime;

    if (effectiveMinutes < 0) {
        errors.push('休息时间和摸鱼时间不能超过总工作时长');
    }

    if (data.monthlyRent < 0 || data.monthlyRent > 50000) {
        errors.push('月均房租必须在0-50000元之间');
    }

    if (data.dailyMealCost < 0 || data.dailyMealCost > 500) {
        errors.push('日均餐费必须在0-500元之间');
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * 处理表单提交
 * @param {Event} event - 提交事件
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('#calculateBtn');
    const resultContainer = document.getElementById('resultContainer');

    clearResult(resultContainer);

    const data = getFormData();
    const validation = validateFormData(data);

    if (!validation.valid) {
        alert(validation.errors.join('\n'));
        return;
    }

    const stopLoading = showLoading(submitButton);

    try {
        const result = calculateHourlyWage(data);

        appState.result = result;
        appState.input = { ...data };

        renderAchievementCard(result, resultContainer);

        if (!result.specialCase) {
            renderFunComparisons(result.funComparisons, resultContainer);
        }

        renderUnlockedAchievements(result.achievements, resultContainer);

        const processContainer = document.getElementById('calculationProcess');
        renderCalculationProcess(result.calculationSteps, processContainer);

        setTimeout(() => {
            scrollToResult(resultContainer);
        }, 100);

    } catch (error) {
        console.error('计算错误:', error);
        alert('计算过程出现错误，请检查输入数据');
    } finally {
        stopLoading();
    }
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
    const form = document.getElementById('calculatorForm');

    form.addEventListener('submit', handleFormSubmit);

    const salaryType = document.getElementById('salaryType');
    const workDaysType = document.getElementById('workDaysType');

    salaryType.addEventListener('change', () => {
        renderSalaryUnit(salaryType.value);
    });

    workDaysType.addEventListener('change', () => {
        renderCustomDaysInput(workDaysType.value);
    });

    renderSliderValue('breakTime', 'breakTimeValue');
    renderSliderValue('slackOffTime', 'slackOffTimeValue');
    renderSliderValue('commuteTime', 'commuteTimeValue');

    initStarRating('atmosphereRating', appState.input.atmosphereRating, (rating) => {
        appState.input.atmosphereRating = rating;
        renderRatingLabel('atmosphere', rating);
    });

    initStarRating('colleagueRating', appState.input.colleagueRating, (rating) => {
        appState.input.colleagueRating = rating;
        renderRatingLabel('colleague', rating);
    });

    initStarRating('workspaceRating', appState.input.workspaceRating, (rating) => {
        appState.input.workspaceRating = rating;
        renderRatingLabel('workspace', rating);
    });

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const form = document.getElementById('calculatorForm');
                if (form) {
                    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
            }
        });
    });
}

/**
 * 初始化应用
 */
function initApp() {
    renderSalaryUnit('monthly');
    renderCustomDaysInput('doubleRest');
    initEventListeners();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);

export { appState, getFormData, validateFormData };
