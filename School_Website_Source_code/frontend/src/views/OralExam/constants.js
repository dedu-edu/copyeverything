import { challenge_types, get_questionype } from "@src/utility/Utils";

export const questionType = get_questionype().filter(item => item.name === 'Бичвэр')
export const oralExam = challenge_types().find(item => item.name === 'Аман шалгалт')
