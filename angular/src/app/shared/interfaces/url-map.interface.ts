export interface IUrlMap {
	[key: string]: {
		title: string;
		type: string;
		isRegister: boolean | null;
		isReport: boolean | null;
	};
}
