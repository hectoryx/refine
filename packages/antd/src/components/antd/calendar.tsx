import { Dayjs } from "dayjs";
import dayjsGenerateConfig from "rc-picker/lib/generate/dayjs";
import generateCalendar from "antd/lib/calendar/generateCalendar";
// import "antd/es/calendar/style/index.css";

const Calendar = generateCalendar<Dayjs>(dayjsGenerateConfig);

export default Calendar;
