import { Request, Response } from "express";
import { Pagination } from "../types/types";
import { getAllCountries, getCountryById } from "./country.service";


export const getAllCountriesHandler = async (req: Request, res: Response) => {
    try {
        const pagination: Pagination = {
            page: +(req.query.page || 1),
            limit: +(req.query.limit || 10),
        }
        const countries = await getAllCountries(pagination);
        res.status(200).json(countries)
    } catch (error: any) {
        res.status(500).json({
            details: error.message
        })
    }
}


export const getCountryByIdHandler = async ( req: Request, res: Response) => {
    try {
        const id = +req.params.id
        const country = await getCountryById(id)
        res.status(200).json(country)
    } catch (error: any) {
        res.status(500).json({
            details: error.message
        })
    }
}