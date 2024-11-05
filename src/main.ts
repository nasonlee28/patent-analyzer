import app from "./api";
import { errorHandler } from "./exceptions";

const port = 3000;

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
