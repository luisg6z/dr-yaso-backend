import { RequestHandler } from 'express'
import { productCreateSchema, productUpdateSchema } from './products.schemas'
import {
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getAllProducts,
    getProductsStockForFranchise,
    getProductStockForFranchise,
} from './products.service'

export const createProductController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const parsed = productCreateSchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid body',
                errors: parsed.error.flatten(),
            })
            return
        }
        const row = await createProduct(parsed.data)
        res.status(201).json(row)
        return
    } catch (err) {
        next(err)
        return
    }
}

export const updateProductController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const id = Number(req.params.id)
        const parsed = productUpdateSchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid body',
                errors: parsed.error.flatten(),
            })
            return
        }
        const row = await updateProduct(id, parsed.data)
        res.json(row)
        return
    } catch (err) {
        next(err)
        return
    }
}

export const deleteProductController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const id = Number(req.params.id)
        const result = await deleteProduct(id)
        res.json(result)
        return
    } catch (err) {
        next(err)
        return
    }
}

export const getProductByIdController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const id = Number(req.params.id)
        const row = await getProductById(id)
        if (!row) {
            res.status(404).json({ message: 'Producto no encontrado' })
            return
        }
        res.json(row)
        return
    } catch (err) {
        next(err)
        return
    }
}

export const getAllProductsController: RequestHandler = async (
    _req,
    res,
    next,
) => {
    try {
        const page = Number(_req.query.page ?? 1)
        const limit = Number(_req.query.limit ?? 10)
        const result = await getAllProducts({ page, limit })
        res.json(result)
        return
    } catch (err) {
        next(err)
        return
    }
}

export const getProductsStockForFranchiseController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const franchiseId = Number(req.query.franchiseId)
        const page = Number(req.query.page ?? 1)
        const limit = Number(req.query.limit ?? 10)
        if (!Number.isFinite(franchiseId)) {
            res.status(400).json({ message: 'franchiseId requerido' })
            return
        }
        const result = await getProductsStockForFranchise(franchiseId, {
            page,
            limit,
        })
        res.json(result)
        return
    } catch (err) {
        next(err)
        return
    }
}

export const getProductStockForFranchiseController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const productId = Number(req.params.id)
        const franchiseId = Number(req.query.franchiseId)
        if (!Number.isFinite(productId) || !Number.isFinite(franchiseId)) {
            res.status(400).json({ message: 'id y franchiseId requeridos' })
            return
        }
        const stock = await getProductStockForFranchise(productId, franchiseId)
        res.json({ productId, franchiseId, stock })
        return
    } catch (err) {
        next(err)
        return
    }
}
