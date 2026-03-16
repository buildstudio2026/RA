import { PrismaClient } from '@prisma/client'
import { regulations } from '../lib/data'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // Clear existing data
    await prisma.regulation.deleteMany({})

    for (const r of regulations) {
        const { id, lastUpdated, ...rest } = r
        await prisma.regulation.create({
            data: {
                ...rest,
                lastUpdated: new Date(lastUpdated.replace(/\./g, '-'))
            },
        })
    }
    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
