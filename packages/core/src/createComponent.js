import { createObject } from './createObject.js'
import { createMemoMap } from './createMemoMap.js'
import { createComponentId } from './createComponentId.js'

import { toCssRules } from './convert/toCssRules.js'
import { toTailDashed } from './convert/toDashed.js'

const $$composers = Symbol.for('sxs.composers')

/** @typedef {import('.').Config} Config */
/** @typedef {import('.').Style} Style */
/** @typedef {import('.').Group} Group */
/** @typedef {import('.').GroupRules} GroupRules */
/** @typedef {import('.').GroupSheet} GroupSheet */

/** @typedef {[string, {}, Variant[], { [name: string]: any }]} Composer */
/** @typedef {{ [name: string]: string }} VariantMatches */
/** @typedef {[VariantMatches, {}]} Variant */

/** @typedef {{ css: Style } & VariantMatches} CompoundVariantsInit */
/** @typedef {{ [name: string]: any }} DefaultVariants */
/** @typedef {{ [name: string]: { [value: string]: Style } }} SingularVariantsInit */
/** @typedef {{ variants: SingularVariantsInit, compoundVariants: CompoundVariantsInit, defaultVariants: DefaultVariants } & Style} ComposerInit */

const createComponentFunctionMap = createMemoMap()

/** Returns a function that applies component styles. */
export const createComponentFunction = (/** @type {Config} */ config, /** @type {GroupSheet} */ sheet) =>
	createComponentFunctionMap(config, () => (...args) => {
		/** @type {string | Function} Component type, which may be a function or a string. */
		let componentType = null

		/** @type {Set<Composer>} Composers. */
		const composers = new Set()

		const possibleVariants = {}
		const defaultVariants = {}

		for (const arg of args) {
			// skip any void argument
			if (arg == null) continue

			switch (typeof arg) {
				case 'function':
					// allow a composer-less function to be the component type
					if (componentType == null && !arg[$$composers]) {
						componentType = arg

						break
					}

				case 'object':
					// allow a type property to be this component type
					if (componentType == null && arg.type != null) componentType = arg.type

					// copy all composers into this component
					if ($$composers in arg)
						for (const composer of arg[$$composers]) {
							composers.add(composer)

							for (const name in composer[3]) {
								if (!possibleVariants.hasOwnProperty(name)) possibleVariants[name] = new Set()
								if (!defaultVariants.hasOwnProperty(name)) defaultVariants[name] = composer[3][name]
							}

							for (const variant of composer[2]) {
								for (const name in variant[0]) {
									possibleVariants[name].add(variant[0][name])
								}
							}
						}
					// otherwise, add a new composer to this component
					else if (!('$$typeof' in arg)) {
						const composer = createComposer(arg, config)

						composers.add(composer)

						for (const name in composer[3]) {
							if (!possibleVariants.hasOwnProperty(name)) possibleVariants[name] = new Set()
							if (!defaultVariants.hasOwnProperty(name)) defaultVariants[name] = composer[3][name]
						}

						for (const variant of composer[2]) {
							for (const name in variant[0]) {
								possibleVariants[name].add(variant[0][name])
							}
						}
					}

					break

				case 'string':
					componentType = arg
			}
		}

		// set the component type if none was set
		if (componentType == null) componentType = 'span'
		if (!composers.size) composers.add(['PJLV', {}, [], Object.create(null)])

		return createRenderer(config, componentType, composers, defaultVariants, possibleVariants, sheet)
	})

/** Creates a composer from a configuration object. */
const createComposer = (/** @type {ComposerInit} */ { variants: singularVariants, compoundVariants, defaultVariants, ...style }, /** @type {Config} */ config) => {
	/** @type {string} Composer Unique Identifier. @see `{CONFIG_PREFIX}-?c-{STYLE_HASH}` */
	const className = `${toTailDashed(config.prefix)}c-${createComponentId(style)}`

	/** @type {Variant[]} */
	const variants = []

	defaultVariants = Object.assign({}, defaultVariants)

	const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key)

	// add singular variants
	if (typeof singularVariants === 'object' && singularVariants) {
		for (const name in singularVariants) {
			if (!hasOwn(defaultVariants, name)) defaultVariants[name] = 'undefined'

			const variantPairs = singularVariants[name]

			for (const pair in variantPairs) {
				/** @type {VariantMatches} */
				const vMatch = { [name]: String(pair) }

				/** @type {Style} */
				const vStyle = variantPairs[pair]

				/** @type {Variant} */
				const variant = [vMatch, vStyle]

				variants.push(variant)
			}
		}
	}

	// add compound variants
	if (typeof compoundVariants === 'object' && compoundVariants) {
		for (const compoundVariant of compoundVariants) {
			let { css: vStyle, ...vMatch } = compoundVariant

			vStyle = (typeof vStyle === 'object' && vStyle) || {}

			for (const name in vMatch) vMatch[name] = String(vMatch[name])

			/** @type {Variant} */
			const variant = [vMatch, vStyle]

			variants.push(variant)
		}
	}

	return /** @type {Composer} */ ([className, style, variants, defaultVariants])
} // prettier-ignore

const createRenderer = (
	/** @type {Config} */ config,
	/** @type {string | Function} */ type,
	/** @type {Set<Composer>} */ composers,
	/** @type {DefaultVariants} */ defaultVariants,
	/** @type {{ [name: string]: Set<string> }} */ possibleVariants,
	/** @type {GroupSheet} */ sheet
) => {
	const [className] = composers.keys().next().value
	const selector = `.${className}`

	const render = (props) => {
		props = (typeof props === 'object' && props) || {}

		const { css, ...forwardProps } = props

		let comparablePropsLead = {}
		let comparablePropsTail = { ...forwardProps }

		const defaultVariants = getDefaultVariantsFromComposers(composers)

		for (const name in defaultVariants) {
			if (name in comparablePropsTail) {
				let propData = comparablePropsTail[name]
				if (typeof propData === 'object' && propData !== null) {
					comparablePropsTail[name] = {
						'@initial': defaultVariants[name],
						...propData,
					}
					continue
				}
				propData = String(propData)
				if (propData === 'undefined' && !possibleVariants[name].has('undefined')) {
					comparablePropsTail[name] = defaultVariants[name]
				}
			} else {
				comparablePropsLead[name] = defaultVariants[name]
			}
		}

		const { children, ...comparableProps } = { ...comparablePropsLead, ...comparablePropsTail }

		/** @type {string[]} */
		const classSet = new Set

		for (const [composerClassName, composerStyle, composerVariants] of composers) {
			classSet.add(composerClassName)

			if (!sheet.rules.styled.cache.has(composerClassName)) {
				sheet.rules.styled.cache.add(composerClassName)
				let index = sheet.rules.styled.group.cssRules.length
				for (const cssText of toCssRules(composerStyle, [`.${composerClassName}`], [], config)) {
					sheet.rules.styled.group.insertRule(cssText, index++)
				}
			}

			const variantsToAdd = []

			variants: for (let [vMatch, vStyle] of composerVariants) {
				// skip empty variants
				if (!Object.keys(vStyle).length) continue

				let variantIndex = 0

				for (const name in vMatch) {
					delete forwardProps[name]

					const matchingPair = vMatch[name]
					let comparablePair = comparableProps[name]
					comparablePair = typeof comparablePair === 'object' && comparablePair || String(comparablePair)

					// exact matches
					if (comparablePair === matchingPair) continue
					// responsive matches
					else if (name in comparableProps && typeof comparablePair === 'object' && comparablePair !== null) {
						let didMatch = false
						for (const query in comparablePair) {
							if (String(comparablePair[query]) === matchingPair) {
								if (query !== '@initial') {
									vStyle = {
										[query in config.media ? config.media[query] : query]: vStyle
									}
								}
								variantIndex += Object.keys(comparablePair).indexOf(query)
								didMatch = true
							}
						}
						if (!didMatch) continue variants
					}
					// non-matches
					else continue variants
				}

				;(variantsToAdd[variantIndex] = variantsToAdd[variantIndex] || []).push(vStyle)
			}

			for (const variantToAdd of variantsToAdd) {
				if (variantToAdd === undefined) continue

				for (const vStyle of variantToAdd) {
					const variantClassName = `${composerClassName}-${createComponentId(vStyle)}-variant`
					classSet.add(variantClassName)
					if (!sheet.rules.varied.cache.has(variantClassName)) {
						sheet.rules.varied.cache.add(variantClassName)
						let index = sheet.rules.varied.group.cssRules.length
						for (const cssText of toCssRules(vStyle, [`.${variantClassName}`], [], config)) {
							sheet.rules.varied.group.insertRule(cssText, index++)
						}
					}
				}
			}
		}

		// apply css property styles
		if (typeof css === 'object' && css) {
			/** @type {string} Inline Class Unique Identifier. @see `{COMPOSER_UUID}-i{VARIANT_UUID}-css` */
			const iClass = `${className}-i${createComponentId(css)}-css`

			classSet.add(iClass)

			if (!sheet.rules.inline.cache.has(iClass)) {
				sheet.rules.inline.cache.add(iClass)

				let index = sheet.rules.inline.group.cssRules.length
				for (const cssText of toCssRules(css, [`.${iClass}`], [], config)) {
					sheet.rules.inline.group.insertRule(cssText, index++)
				}
			}
		}

		for (const propClassName of String(props.className || '').trim().split(/\s+/)) {
			if (propClassName) classSet.add(propClassName)
		}

		const renderedClassName = forwardProps.className = [ ...classSet ].join(' ')

		const renderedToString = () => renderedClassName

		return {
			type,
			className: renderedClassName,
			selector,
			props: forwardProps,
			toString: renderedToString,
			[Symbol.toPrimitive]: renderedToString,
		}
	}

	const baseToString = () => {
		if (!sheet.rules.styled.cache.has(className)) render()
		return className
	}

	return createObject(render, {
		type,
		className,
		selector,
		[$$composers]: composers,
		toString: baseToString,
		[Symbol.toPrimitive]: baseToString,
	})
} // prettier-ignore

const getDefaultVariantsFromComposers = (composers) => {
	const defaultVariants = {}

	for (const [, , , composerDefaultVariants] of composers) {
		for (const name in composerDefaultVariants) {
			defaultVariants[name] = String(composerDefaultVariants[name])
		}
	}

	return defaultVariants
}
