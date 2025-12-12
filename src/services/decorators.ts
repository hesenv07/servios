const PUBLIC_METADATA_KEY = Symbol('servios:public');
const PUBLIC_CLASS_KEY = Symbol('servios:public:class');

interface PublicMetadata {
  [methodName: string]: boolean;
}

export function Public(): any {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    if (propertyKey === undefined && descriptor === undefined) {
      target.prototype[PUBLIC_CLASS_KEY] = true;
      return target;
    }

    if (propertyKey && descriptor) {
      if (!target[PUBLIC_METADATA_KEY]) {
        target[PUBLIC_METADATA_KEY] = {};
      }

      target[PUBLIC_METADATA_KEY][propertyKey] = true;

      return descriptor;
    }
  };
}

export function isPublicMethod(target: any, methodName: string): boolean {
  const isClassPublic =
    target[PUBLIC_CLASS_KEY] || target.constructor?.prototype?.[PUBLIC_CLASS_KEY];

  if (isClassPublic === true) {
    return true;
  }

  const metadata: PublicMetadata | undefined =
    target[PUBLIC_METADATA_KEY] || target.constructor?.prototype?.[PUBLIC_METADATA_KEY];

  return metadata?.[methodName] === true;
}

export function getPublicMethods(target: any): string[] {
  const isClassPublic =
    target[PUBLIC_CLASS_KEY] || target.constructor?.prototype?.[PUBLIC_CLASS_KEY];

  if (isClassPublic === true) {
    const proto = target.constructor?.prototype || target;
    return Object.getOwnPropertyNames(proto).filter(
      (name) => name !== 'constructor' && typeof proto[name] === 'function',
    );
  }

  const metadata: PublicMetadata | undefined =
    target[PUBLIC_METADATA_KEY] || target.constructor?.prototype?.[PUBLIC_METADATA_KEY];

  if (!metadata) return [];

  return Object.keys(metadata).filter((key) => metadata[key] === true);
}

export { PUBLIC_METADATA_KEY, PUBLIC_CLASS_KEY };
