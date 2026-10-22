const test = require('node:test')
const assert = require('node:assert/strict')
const { parseEmailField, buildRecipients } = require('../middleware/emailRecipients')

test('trims harmless whitespace around one address', () => {
    assert.deepEqual(parseEmailField('  Cigarscottsdale@yahoo.com  ', 'client'), {
        addresses: ['Cigarscottsdale@yahoo.com'],
        dropped: [],
    })
})

test('splits valid addresses separated by spaces or semicolons', () => {
    assert.deepEqual(
        parseEmailField(
            'Clayton@casbarcigar.com Lafayette@casbarcigar.com; jimmy@estebancarreras.com',
            'client',
        ),
        {
            addresses: [
                'Clayton@casbarcigar.com',
                'Lafayette@casbarcigar.com',
                'jimmy@estebancarreras.com',
            ],
            dropped: [],
        },
    )
})

test('drops a malformed value instead of passing it to Resend', () => {
    assert.deepEqual(parseEmailField('smokeshacsmhitimewine.net', 'client'), {
        addresses: [],
        dropped: [{ source: 'client', value: 'smokeshacsmhitimewine.net' }],
    })
})

test('keeps a regular order deliverable when the client address is malformed', () => {
    const result = buildRecipients({
        isEstimate: false,
        client: { email: 'smokeshacsmhitimewine.net' },
        salesman: { email: 'jimmy@estebancarreras.com' },
        emails: [],
    }, ['henryschreiner@mac.com'])

    assert.deepEqual(result.recipients, [
        'henryschreiner@mac.com',
        'jimmy@estebancarreras.com',
    ])
    assert.deepEqual(result.dropped, [
        { source: 'client', value: 'smokeshacsmhitimewine.net' },
    ])
})

test('uses split client addresses as recipients for an estimate', () => {
    const result = buildRecipients({
        isEstimate: true,
        client: { email: 'Clayton@casbarcigar.com Lafayette@casbarcigar.com' },
        salesman: { email: 'jimmy@estebancarreras.com' },
        emails: [],
    }, ['henryschreiner@mac.com'])

    assert.deepEqual(result.recipients, [
        'Clayton@casbarcigar.com',
        'Lafayette@casbarcigar.com',
        'jimmy@estebancarreras.com',
    ])
})

test('deduplicates recipients without changing their order', () => {
    const result = buildRecipients({
        isEstimate: false,
        client: { email: 'HENRYschreiner@mac.com' },
        salesman: { email: 'jimmy@estebancarreras.com' },
        emails: ['jimmy@estebancarreras.com'],
    }, ['henryschreiner@mac.com'])

    assert.deepEqual(result.recipients, [
        'henryschreiner@mac.com',
        'jimmy@estebancarreras.com',
    ])
})
