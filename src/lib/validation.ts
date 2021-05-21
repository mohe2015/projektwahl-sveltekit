import type { ReadOnlyFormData } from "@sveltejs/kit/types/helper";

export function assertHas(data: ReadOnlyFormData, field: string): {[index: string]: string} {
    if (!data.has(field)) {
        return {
            [field]: `${field} fehlt!`
        }
    }
    return {}
}

export function assertNotEmpty(data: ReadOnlyFormData, field: string): {[index: string]: string} {
    return {
        ...assertHas(data, field),
        ...(data.get(field).trim().length == 0 ? {
            [field]: `${field} ist leer!`
        } : {})
    }
}

export function assertOneOf(data: ReadOnlyFormData, field: string, oneOf: Array<string>): {[index: string]: string} {
    return {
        ...assertHas(data, field),
        ...(!oneOf.includes(data.get(field)) ? {
            [field]: `${field} ist keines von ${oneOf}!`
        } : {})
    }
}

export function assertBoolean(data: ReadOnlyFormData, field: string): {[index: string]: string} {
    return {
        ...((data.has(field) && data.get(field) !== "on") ? {
            [field]: `${field} hat einen ungültigen Wert!`
        } : {})
    }
}