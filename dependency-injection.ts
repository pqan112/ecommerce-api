// dependency injection là một design pattern trong lập trình hướng đối tượng
// Giúp tăng tính tái sử dụng code, giảm trùng lặp và dễ dàng kiểm thử

class TimeLogger {
  // logFn được gọi là dependency
  constructor(private logFn: (message: string) => void) {}

  log(message: string) {
    const now = new Date().toISOString();
    this.logFn(`${now}: ${message}`);
  }
}

// inject console.log và console.warn vào TimeLogger
const logWithTime2 = new TimeLogger(console.log);
const warnWithTime2 = new TimeLogger(console.warn);

logWithTime2.log("Hello");
warnWithTime2.log("Hello");
