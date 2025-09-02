# EPUB阅读器 - 标记功能修复说明

## 问题描述
原版本存在"标记会漏标"的问题，主要表现为：
- 翻页后标记丢失
- 某些文本节点上的标记无法正确应用
- 动态加载内容后标记未及时更新

## 修复内容

### 1. 改进的标记应用机制
- **智能文本节点过滤**：使用 `NodeFilter` 精确识别需要应用标记的文本节点
- **内容预检查**：只处理包含标记词的文本节点，提高性能
- **重叠匹配处理**：智能合并重叠的标记匹配项

### 2. 自动重试机制
- **延迟重试**：标记应用失败时自动重试，最多3次
- **智能验证**：验证标记是否成功应用，失败时触发重试
- **防抖优化**：避免频繁的标记应用操作

### 3. DOM变化监听
- **MutationObserver**：监听iframe内容变化，自动重新应用标记
- **加载状态检测**：等待iframe完全加载后再应用标记
- **实时响应**：页面内容变化时立即响应

### 4. 调试和状态检查
- **标记状态检查**：实时查看标记数据加载状态
- **强制重新应用**：手动触发标记重新应用
- **详细日志**：控制台输出详细的标记应用过程

## 使用方法

### 检查标记状态
1. 打开设置面板（点击⚙按钮）
2. 在"标记管理"部分找到"检查标记状态"按钮
3. 点击查看当前标记数据状态

### 强制重新应用标记
1. 在设置面板中找到"强制重新应用标记"按钮
2. 点击强制重新应用所有标记
3. 查看控制台输出了解应用过程

### 查看详细日志
1. 打开浏览器开发者工具（F12）
2. 查看控制台输出
3. 标记应用过程会显示详细的日志信息

## 技术改进

### 文本节点处理
```javascript
// 改进的文本节点查找
function processTextNodes() {
    const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
        acceptNode: function(node) {
            // 智能过滤，只处理包含标记词的文本节点
            const hasMarkWords = wordData.some(({ word }) => 
                node.textContent.toLowerCase().includes(word.toLowerCase())
            );
            return hasMarkWords ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
    }, false);
    // ... 处理逻辑
}
```

### 自动重试机制
```javascript
function applyMarksWithRetry(maxRetries = 3, delay = 500) {
    let retryCount = 0;
    
    function attemptApply() {
        try {
            applyMarks();
            // 验证标记是否成功应用
            // 失败时自动重试
        } catch (error) {
            if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(attemptApply, delay);
            }
        }
    }
    
    attemptApply();
}
```

### DOM变化监听
```javascript
function setupMarkObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                // 检测到新的iframe时自动应用标记
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'IFRAME') {
                        // 等待加载完成后应用标记
                    }
                });
            }
        });
    });
    
    observer.observe(viewer, { childList: true, subtree: true });
}
```

## 性能优化

1. **智能过滤**：只处理包含标记词的文本节点
2. **批量操作**：使用DocumentFragment批量处理DOM操作
3. **防抖处理**：避免频繁的标记应用操作
4. **延迟加载**：等待内容完全加载后再应用标记

## 兼容性

- 支持现代浏览器（Chrome、Firefox、Safari、Edge）
- 兼容移动设备
- 支持PWA功能

## 故障排除

### 标记仍然丢失
1. 检查控制台是否有错误信息
2. 使用"检查标记状态"按钮查看数据状态
3. 尝试"强制重新应用标记"

### 性能问题
1. 减少标记词数量
2. 检查是否有大量重复标记
3. 使用"检查标记状态"查看数据量

### 数据异常
1. 刷新页面重新加载
2. 检查浏览器存储是否正常
3. 尝试导入/导出标记数据

## 更新日志

### v1.1.0 (当前版本)
- ✅ 修复标记漏标问题
- ✅ 添加自动重试机制
- ✅ 改进DOM变化监听
- ✅ 增加调试和状态检查功能
- ✅ 优化性能和稳定性

### v1.0.0
- 基础标记功能
- EPUB文件支持
- 基本阅读功能
