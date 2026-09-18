import * as Yup from "yup";

export const validatePassSchema = Yup.object().shape({
	old_password: Yup.string().trim().required("Хоосон байна"),
	password: Yup.string()
		.min(8, "Нууц үг хамгийн багадаа 8 тэмдэгт байна")
		.matches(/^(?!\d+$).+$/, "Нууц үг зөвхөн тооноос бүрдэхгүй байх ёстой")
		.notOneOf([Yup.ref("old_password")], "Шинэ нууц үг хуучин нууц үгээс ялгаатай байна")
		.required("Нууц үг оруулна уу"),
	confirm_password: Yup.string()
		.oneOf([Yup.ref("password"), null], "Нууц үгүүд ижил биш байна")
		.required("Нууц үгээ давтан оруулна уу")
		.max(80),
});
