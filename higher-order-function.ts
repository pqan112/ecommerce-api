// HOF: được dùng trong lập trình hàm,
// tăng tính tái sử dụng code, giảm duplicate code và dễ dàng kiểm thử

const logWithTime1 = (message: string) => {
  const now = new Date().toISOString();
  console.log(`${now}: ${message}`);
};

const warnWithTime1 = (message: string) => {
  const now = new Date().toISOString();
  console.warn(`${now}: ${message}`);
};

logWithTime1("An nè");
warnWithTime1("An nè");

const createLogWithTime1 = (logFn: (message: string) => void) => {
  return (message: string) => {
    const now = new Date().toISOString();
    logFn(`${now}: ${message}`);
  };
};

// run function
// 1.
createLogWithTime1(console.log)("An nè");
// 2.
const warningLog1 = createLogWithTime1(console.warn);
warningLog1("An nè");
