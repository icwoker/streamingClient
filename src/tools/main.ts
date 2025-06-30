/**
 * 防抖函数
 * @param func 需要防抖的函数
 * @param wait 等待时间(毫秒)
 * @param immediate 是否立即执行
 * @returns 返回防抖处理后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => ReturnType<T> | void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ): ReturnType<T> | void {
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) {
        return func.apply(context, args);
      }
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    // THIS LINE WAS MISSING - set the timeout
    timeout = setTimeout(later, wait);

    if (callNow) {
      return func.apply(context, args);
    }
  };
}

/**
 * 节流函数 - 限制函数在一定时间内最多执行一次
 * @param func 需要节流的函数
 * @param wait 等待时间(毫秒)
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastCallTime: number | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    const now = Date.now();

    // 首次调用或者已经过了等待时间
    if (lastCallTime === null || now - lastCallTime >= wait) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCallTime = now;
      func.apply(context, args);
    }
    // 如果在等待时间内被调用，不做任何处理
    // 这是纯节流的特性 - 在时间窗口内忽略额外的调用
  };
}
