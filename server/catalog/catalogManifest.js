const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const CATALOG_TITLE = 'Esteban Carreras 2026 Product Catalogue'
const PAGE_DIRECTORY = path.join(__dirname, 'pages')
const PDF_FILENAME = 'EC_Product_Catalog_2026.pdf'
const PDF_PATH = path.resolve(__dirname, '../../output/pdf', PDF_FILENAME)

const sectionForPage = (pageNumber) => {
    if (pageNumber <= 3) return 'About Esteban Carreras'
    if (pageNumber <= 9) return 'Chupa Cabra Collection'
    if (pageNumber <= 33) return 'Product Portfolio'
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
        .replace(/\bL (\d)\b/g, 'L-$1')
}

const getPageFiles = () => {
    if (!fs.existsSync(PAGE_DIRECTORY)) return []

    return fs.readdirSync(PAGE_DIRECTORY)
        .filter(filename => /^\d{3}_.+\.jpe?g$/i.test(filename))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

// Content hash per page, memoized on mtime+size so it's only recomputed when
// a file actually changes. Used as a cache-busting query on page URLs, since
// those responses are served as immutable.
const versionCache = new Map()
const getPageVersion = (filename) => {
    const filePath = path.join(PAGE_DIRECTORY, filename)
    const { mtimeMs, size } = fs.statSync(filePath)
    const cached = versionCache.get(filename)
    if (cached && cached.mtimeMs === mtimeMs && cached.size === size) return cached.version

    const version = crypto.createHash('sha1').update(fs.readFileSync(filePath)).digest('hex').slice(0, 10)
    versionCache.set(filename, { mtimeMs, size, version })
    return version
}

const getCatalogPages = () => getPageFiles().map((filename, index) => {
    const number = index + 1
    const version = getPageVersion(filename)
    return {
        number,
        filename,
        title: titleFromFilename(filename),
        section: sectionForPage(number),
        version,
        imageUrl: `/api/catalog/pages/${encodeURIComponent(filename)}?v=${version}`,
        thumbnailUrl: `/api/catalog/thumbnails/${encodeURIComponent(filename)}?v=${version}`,
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
    getPageVersion,
    resolveCatalogPage,
    sectionForPage,
    titleFromFilename,
}
