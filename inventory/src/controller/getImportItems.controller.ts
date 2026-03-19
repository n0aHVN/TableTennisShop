import { Request, Response } from "express";
import { ApiResponse } from "@tabletennisshop/common";
import { ImportService } from "../service/import.service";

export const getImportItemsByProductIdController = async (req: Request, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const items = await ImportService.getImportItemsByProductId(id);

    res.status(200).send({
        success: true,
        statusCode: 200,
        data: items,
    });
};

export const getAvailableItemsByProductIdController = async (req: Request, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const items = await ImportService.getAvailableItemsByProductId(id);

    res.status(200).send({
        success: true,
        statusCode: 200,
        data: items,
    });
};

export const getImportsByProductIdController = async (req: Request, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const imports = await ImportService.getImportsByProductId(id);

    res.status(200).send({
        success: true,
        statusCode: 200,
        data: imports,
    });
};
