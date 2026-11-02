const fs = require('fs')
const path = require('path')

const CATALOG_TITLE = 'Esteban Carreras 2026 Product Catalogue'
const PAGE_DIRECTORY = path.join(__dirname, 'pages')
const PDF_FILENAME = 'EC_Product_Catalog_2026.pdf'
const PDF_PATH = path.resolve(__dirname, '../../output/pdf', PDF_FILENAME)

const sectionForPage = (pageNumber) => {
    if (pageNumber <= 3) return 'About Esteban Carreras'
    if (pageNumber <= 9) return 'Chupacabra Collection'
    if (pageNumber <= 34) return 'Product Portfolio'
    return 'Specialty & Programs'
}

const titleFromFilename = (filename) => {
    const withoutNumber = filename
        .replace(/^\d+_/, '')
        .replace(/\.jpe?g$/i, '')
        .replace(/_s(?=_|$)/g, "'s")
        .replace(/_/g, ' ')

    return withoutNumber
        .replace(/\bEc\b/gi, 'EC')
        .replace(/\bCt\b/g, 'CT')
        .replace(/\bCt\b/gi, 'CT')
        .replace(/\bL (\d)\b/g, 'L-$1')
}

const getPageFiles = () => {
    if (!fs.existsSync(PAGE_DIRECTORY)) return []

    return fs.readdirSync(PAGE_DIRECTORY)
        .filter(filename => /^\d{3}_.+\.jpe?g$/i.test(filename))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

const getCatalogPages = () => getPageFiles().map((filename, index) => {
    const number = index + 1
    return {
        number,
        filename,
        title: titleFromFilename(filename),
        section: sectionForPage(number),
        imageUrl: `/api/catalog/pages/${encodeURIComponent(filename)}`,
        thumbnailUrl: `/api/catalog/thumbnails/${encodeURIComponent(filename)}`,
    }
})

const resolveCatalogPage = (filename) => {
    if (!getPageFiles().includes(filename)) return null
    return path.join(PAGE_DIRECTORY, filename)
}

module.exports = {
    CATALOG_TITLE,
    PAGE_DIRECTORY,
    PDF_FILENAME,
    PDF_PATH,
    getCatalogPages,
    resolveCatalogPage,
    sectionForPage,
    titleFromFilename,
}
