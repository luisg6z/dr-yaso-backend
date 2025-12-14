import { db } from '../db/db'
import { Productos } from '../db/schemas/Productos'
import { TienenStock } from '../db/schemas/TienenStock'
import { AppError } from '../common/errors/errors'
import { eq, and } from 'drizzle-orm'
import { ProductCreate, ProductUpdate } from './products.schemas'

export const createProduct = async (data: ProductCreate) => {
    const [row] = await db.insert(Productos).values(data).returning()
    return row
}

export const updateProduct = async (id: number, data: ProductUpdate) => {
    const [row] = await db
        .update(Productos)
        .set(data)
        .where(eq(Productos.id, id))
        .returning()
    if (!row) throw new AppError(404, 'Producto no encontrado')
    return row
}

export const deleteProduct = async (id: number) => {
    const [row] = await db.delete(Productos).where(eq(Productos.id, id)).returning()
    if (!row) throw new AppError(404, 'Producto no encontrado')
    return { deleted: true }
}

export const getProductById = async (id: number) => {
    const rows = await db.select().from(Productos).where(eq(Productos.id, id))
    return rows[0] ?? null
}

export const getAllProducts = async () => {
    return await db.select().from(Productos)
}

// Stock actual en la sede para un producto = saldoFinal del último movimiento
export const getProductStockForFranchise = async (productId: number, franchiseId: number) => {
    const [stock] = await db
        .select({ stockActual: TienenStock.stockActual })
        .from(TienenStock)
        .where(and(eq(TienenStock.idProducto, productId), eq(TienenStock.idFranquicia, franchiseId)))
        .limit(1)
    return stock?.stockActual ?? 0
}

export const getProductsStockForFranchise = async (franchiseId: number) => {
    const products = await db.select().from(Productos)
    const items = await Promise.all(
        products.map(async (p) => ({
            ...p,
            stock: await getProductStockForFranchise(p.id, franchiseId),
        })),
    )
    return { items }
}