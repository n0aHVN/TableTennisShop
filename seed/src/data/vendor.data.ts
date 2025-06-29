import { VendorAttrs } from "@tabletennisshop/common";

export const getVendorData = async (): Promise<VendorAttrs[]> => {
    const VendorData: VendorAttrs[] = [
        {
            name: "Vendor 1",
            addresses: [{
                province: "Ho Chi Minh City",
                district: "District 1",
                ward: "Ben Nghe",
                address: "123 Le Loi Street",
                phone_number: "0901234567"
            }]
        },
        {
            name: "Vendor 2",
            addresses: [{
                province: "Ha Noi",
                district: "Ba Dinh",
                ward: "Cong Vi",
                address: "456 Kim Ma Street",
                phone_number: "0912345678"
            }]
        }
    ];

    return VendorData;
}