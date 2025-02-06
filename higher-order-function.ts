// HOF: được dùng trong lập trình hàm,
// tăng tính tái sử dụng code, giảm duplicate code và dễ dàng kiểm thử

const logWithTime = (message: string) => {
  const now = new Date().toISOString();
  console.log(`${now}: ${message}`);
};

const warnWithTime = (message: string) => {
  const now = new Date().toISOString();
  console.warn(`${now}: ${message}`);
};

logWithTime("An nè");
warnWithTime("An nè");

const createLogWithTime = (logFn: (message: string) => void) => {
  return (message: string) => {
    const now = new Date().toISOString();
    logFn(`${now}: ${message}`);
  };
};

// run function
// 1.
createLogWithTime(console.log)("An nè");
// 2.
const warningLog = createLogWithTime(console.warn);
warningLog("An nè");
