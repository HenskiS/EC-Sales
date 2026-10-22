const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const stripEnds = (value) => value.trim().replace(/^[.,;]+|[.,;]+$/g, '')

const parseEmailField = (raw, source = 'unknown') => {
    if (!raw) return { addresses: [], dropped: [] }

    const addresses = []
    const dropped = []

    for (let part of String(raw).split(';')) {
        part = stripEnds(part)
        if (!part) continue

        if (EMAIL_RE.test(part)) {
            addresses.push(part)
            continue
        }

        const tokens = part.split(/[\s,]+/).map(stripEnds).filter(Boolean)
        if (tokens.length > 1 && tokens.every(token => EMAIL_RE.test(token))) {
            addresses.push(...tokens)
        } else {
            dropped.push({ source, value: part })
        }
    }

    return { addresses, dropped }
}

const buildRecipients = (data, configuredEmails = []) => {
    const recipients = []
    const dropped = []

    const add = (raw, source) => {
        const parsed = parseEmailField(raw, source)
        recipients.push(...parsed.addresses)
        dropped.push(...parsed.dropped)
        return parsed.addresses
    }

    if (!data.isEstimate) {
        for (const email of configuredEmails || []) add(email, 'configured')
    }

    add(data.client?.email, 'client')
    const salesmanEmails = add(data.salesman?.email, 'salesman')

    for (const email of data.emails || []) add(email, 'additional')

    const seen = new Set()
    const uniqueRecipients = recipients.filter(email => {
        const normalized = email.toLowerCase()
        if (seen.has(normalized)) return false
        seen.add(normalized)
        return true
    })

    return { recipients: uniqueRecipients, salesmanEmails, dropped }
}

module.exports = {
    EMAIL_RE,
    parseEmailField,
    buildRecipients,
}
