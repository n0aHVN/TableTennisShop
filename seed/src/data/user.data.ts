import { UserAttrs, UserEnum } from "@tabletennisshop/common";
import { UserStatusEnum } from "@tabletennisshop/common/build/enums/user-status.enum";

export const getUserData = (): UserAttrs[] => {
  console.log("Adding user data...");
  
  const userData: UserAttrs[] = [
    {
      username: "superherodung123",
      email: "superherodung123@gmail.com",
      password: "1234",
      full_name: "Nguyen Tri Dung",
      type: UserEnum.CLIENT,
      status: UserStatusEnum.ENABLE,
      address: "Dia chi 1"
    },
    {
      username: "tranquang456",
      email: "tranquang456@gmail.com",
      password: "1234",
      full_name: "Tran Quang",
      type: UserEnum.CLIENT,
      status: UserStatusEnum.ENABLE,
      address: "Dia chi 2"
    },
    {
      username: "lethu987",
      email: "lethu987@gmail.com",
      password: "1234",
      full_name: "Le Thi Thu",
      type: UserEnum.CLIENT,
      status: UserStatusEnum.ENABLE,
      address: "Dia chi 3"
    },
    {
      username: "minhtam321",
      email: "minhtam321@gmail.com",
      password: "1234",
      full_name: "Pham Minh Tam",
      type: UserEnum.CLIENT,
      status: UserStatusEnum.ENABLE,
      address: "Dia chi 4"
    },
    {
      username: "hoangnam456",
      email: "hoangnam456@gmail.com",
      password: "1234",
      full_name: "Hoang Nam",
      type: UserEnum.CLIENT,
      status: UserStatusEnum.ENABLE,
      address: "Dia chi 5"
    },
    {
      username: "bichngoc789",
      email: "bichngoc789@gmail.com",
      password: "1234",
      full_name: "Nguyen Bich Ngoc",
      type: UserEnum.CLIENT,
      status: UserStatusEnum.ENABLE,
      address: "67 Tran Phu Street",
    },
    {
      username: "ducthang112",
      email: "ducthang112@gmail.com",
      password: "1234",
      full_name: "Le Duc Thang",
      type: UserEnum.CLIENT,
      status: UserStatusEnum.ENABLE,
      address: "88 Nguyen Van Linh",
    },
    {
      username: "huyenanh2000",
      email: "huyenanh2000@gmail.com",
      password: "1234",
      full_name: "Do Huyen Anh",
      type: UserEnum.CLIENT,
      status: UserStatusEnum.ENABLE,
      address: "Dia chi 6",
    },
    {
      username: "manhkhoa654",
      email: "manhkhoa654@gmail.com",
      password: "1234",
      full_name: "Nguyen Manh Khoa",
      type: UserEnum.CLIENT,
      status: UserStatusEnum.ENABLE,
      address: "Dia chi 7"
    },
    {
      username: "thanhloan888",
      email: "thanhloan888@gmail.com",
      password: "1234",
      full_name: "Pham Thanh Loan",
      type: UserEnum.CLIENT,
      status: UserStatusEnum.ENABLE,
      address: "Dia chi 8"
    }
  ];
  return userData;
}

