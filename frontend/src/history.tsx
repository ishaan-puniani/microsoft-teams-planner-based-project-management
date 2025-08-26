const History = {
  navigate: (path, ...rest) => {},
  push: (path, ...rest) => History.navigate(path, ...rest),
};

export default History;
