import { RecordModel } from "pocketbase";

export type Parish = RecordModel & {
  name: string;
  userIds: string[];
  logo: string | null;
  created: string;
  updated: string;
};

export type Acolyte = RecordModel & {
  name: string;
  birthday: string;
  parishId: string;
  isInactive: boolean;
  school: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  created: string;
  updated: string;
};
