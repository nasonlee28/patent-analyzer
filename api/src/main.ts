import app from "./api";
import { errorHandler } from "./error/exceptions";

const port = 8080;

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
