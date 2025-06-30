import { ProductTypeEnum, RacketAttrs } from "@tabletennisshop/common";
import { ProductStatusEnum } from "@tabletennisshop/common/build/enums/product-status.enum";

export const getRacketData = async (): Promise<RacketAttrs[]> => {
    const racketData: RacketAttrs[] = [
        {
            name: "Zhang Jike ALC",
            slug: "zhang-jike-alc",
            brand: "Butterfly",
            description: "This is the description",
            sport: "Table Tennis",
            type: ProductTypeEnum.RACKET,
            attributes: {
                speed: "11.8",
                vibration: "10.3",
                weight: "82gr",
                composition: "5 Wood Layers + 2 Arylate Carbon Layers",
                size: "157x150mm",
                thickness: "5.8mm"
            },
            price: 8000000,
            status: ProductStatusEnum.ENABLE
        },
        {
            name: "Viscaria ALC",
            slug: "viscaria-alc",
            brand: "Butterfly",
            description: "This is the description",
            type: ProductTypeEnum.RACKET,
            sport: "Table Tennis",
            attributes: {
                speed: "11.8",
                vibration: "10.3",
                weight: "82gr",
                composition: "5 Wood Layers + 2 Arylate Carbon Layers",
                size: "157x150mm",
                thickness: "5.8mm"
            },
            status: ProductStatusEnum.ENABLE,
            price: 3200000
        },
        {
            name: "Amultart ZLC",
            slug: "amultart-zlc",
            brand: "Butterfly",
            description: "This is the description",
            sport: "Table Tennis",
            type: ProductTypeEnum.RACKET,
            attributes: {
                speed: "12.2",
                vibration: "13.7",
                weight: "76gr",
                composition: "3 Wood Layers + 2 Arylate Carbon Layers",
                size: "157x150mm",
                thickness: "7.1mm"
            },
            price: 3800000,
            status: ProductStatusEnum.ENABLE
        },
        {
            name: "Fan Zhendong ALC",
            slug: "fan-zhendong-alc",
            brand: "Butterfly",
            description: "This is the description",
            sport: "Table Tennis",
            type: ProductTypeEnum.RACKET,
            attributes: {
                speed: "11.8",
                vibration: "10.3",
                composition: "5 Wood Layers + 2 Arylate Carbon Layers",
                size: "157x150mm",
                thickness: "5.8mm"
            },
            price: 3000000,
            status: ProductStatusEnum.ENABLE
        },
        {
            name: "Zhang Jike ALC NDN",
            slug: "zhang-jike-alc-ndn",
            brand: "Butterfly",
            description: "This is the description",
            sport: "Table Tennis",
            type: ProductTypeEnum.RACKET,
            attributes: {
                speed: "11.8",
                vibration: "10.3",
                weight: "82gr",
                composition: "5 Wood Layers + 2 Arylate Carbon Layers",
                size: "157x150mm",
                thickness: "5.8mm"
            },
            price: 9000000,
            status: ProductStatusEnum.ENABLE
        },
        {
            name: "Timo Boll ALC",
            slug: "timo-boll-alc",
            brand: "Butterfly",
            description: "This is the description",
            type: ProductTypeEnum.RACKET,
            sport: "Table Tennis",
            attributes: {
                speed: "11.8",
                vibration: "10.3",
                weight: "85gr",
                composition: "5 Wood Layers + 2 Carbon Layers",
                size: "157x150mm",
                thickness: "5.8mm"
            },
            price: 3000000,
            status: ProductStatusEnum.ENABLE,
        }
    ];
    return racketData;
}

