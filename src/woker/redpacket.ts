/**
 * 创建高精度倒计时（支持传入目标时间字符串）
 * @param {string|Date} endTime 目标时间（字符串或Date对象）
 * @param {function} callback 结束时回调
 * @param {function} [onTick] 倒计时更新回调（可选）
 * @returns {{stop: function}} 包含停止方法的对象
 */
export function createPreciseCountdown(endTime, callback, onTick) {
  // 1. 统一转换为时间戳
  const endTimestamp =
    typeof endTime === "string"
      ? new Date(endTime).getTime()
      : endTime.getTime();

  if (isNaN(endTimestamp)) {
    throw new Error(
      "无效的时间格式，请提供如 '2023-12-31 23:59:59' 的字符串或Date对象"
    );
  }

  // 2. Web Worker代码
  const workerCode = `
      self.onmessage = function(e) {
        const endTime = e.data.endTimestamp;
        
        function check() {
          const remaining = endTime - Date.now();
          if (remaining <= 0) {
            postMessage({ type: 'end' });
            return;
          }
          postMessage({ type: 'tick', remaining });
          setTimeout(check, Math.max(50, Math.min(remaining, 200)));
        }
        
        check();
      };
    `;

  // 3. 创建Worker
  const worker = new Worker(URL.createObjectURL(new Blob([workerCode])));

  worker.onmessage = function (e) {
    if (e.data.type === "end") {
      callback();
      worker.terminate();
    } else if (e.data.type === "tick" && onTick) {
      onTick(e.data.remaining);
    }
  };

  // 4. 启动
  worker.postMessage({ endTimestamp });

  return {
    stop: () => worker.terminate(),
  };
}
