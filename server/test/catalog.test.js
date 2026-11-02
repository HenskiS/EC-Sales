const test = require('node:test')
const assert = require('node:assert/strict')
const {
    getCatalogPages,
    resolveCatalogPage,
    sectionForPage,
    titleFromFilename,
} = require('../catalog/catalogManifest')

test('catalog exposes all numbered pages in order', () => {
    const pages = getCatalogPages()

    assert.equal(pages.length, 41)
    assert.equal(pages[0].filename, '001_Cover.jpg')
    assert.equal(pages.at(-1).filename, '041_Pigtail_Program_L_1_L_3_L_8.jpg')
    assert.deepEqual(pages.map(page => page.number), Array.from({ length: 41 }, (_, index) => index + 1))
})

test('catalog filenames become readable titles and sections', () => {
    assert.equal(
        titleFromFilename('013_Taken_From_The_Dictator_s_Hand_Corojo.jpg'),
        "Taken From The Dictator's Hand Corojo",
    )
    assert.equal(sectionForPage(6), 'Chupacabra Collection')
    assert.equal(sectionForPage(38), 'Specialty & Programs')
})

test('only known catalog filenames resolve to disk', () => {
    assert.ok(resolveCatalogPage('001_Cover.jpg'))
    assert.equal(resolveCatalogPage('../.env'), null)
})
