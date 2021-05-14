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
/** @typedef {[string, VariantMatches, {}]} Variant */

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
								for (const name in variant[1]) {
									possibleVariants[name].add(variant[2][name])
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
							for (const name in variant[1]) {
								possibleVariants[name].add(variant[1][name])
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

	defaultVariants = (typeof defaultVariants === 'object' && defaultVariants) || {}

	// add singular variants
	if (typeof singularVariants === 'object' && singularVariants) {
		for (const name in singularVariants) {
			if (!defaultVariants.hasOwnProperty(name)) defaultVariants[name] = 'undefined'

			const variantPairs = singularVariants[name]

			for (const pair in variantPairs) {
				/** @type {VariantMatches} */
				const vMatch = { [name]: pair }

				/** @type {Style} */
				const vStyle = variantPairs[pair]

				/** @type {string} Variant Unique Identifier @see `{COMPOSER_UUID}-v{VARIANT_UUID}-{VARIANT_NAME}-{VARIANT_VALUE}` */
				const vClass = `${className}-v${createComponentId(vStyle)}-${name}-${pair}`

				/** @type {Variant} */
				const variant = [vClass, vMatch, vStyle]

				variants.push(variant)
			}
		}
	}

	// add compound variants
	if (typeof compoundVariants === 'object' && compoundVariants) {
		for (const compoundVariant of compoundVariants) {
			let { css: variantStyle, ...variantMatches } = compoundVariant

			variantStyle = (typeof variantStyle === 'object' && variantStyle) || {}

			/** @type {string} @see `{COMPOSER_UUID}-c{VARIANT_UUID}` */
			/** @type {string} Compound Variant Unique Identifier @see `{COMPOSER_UUID}-c{VARIANT_UUID}` */
			const vClass = `${className}-c${createComponentId(variantStyle)}`

			/** @type {Variant} */
			const variant = [vClass, variantMatches, variantStyle]

			variants.push(variant)
		}
	}

	return /** @type {Composer} */ ([className, style, variants, defaultVariants])
}

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

		/** Compared props. */
		const comparedProps = { ...defaultVariants, ...forwardProps }

		/** @type {string[]} */
		const classSet = new Set

		// apply each composer
		for (const [composerClassName, composerStyle, composerVariants] of composers) {
			classSet.add(composerClassName)

			if (!sheet.rules.styled.cache.has(composerClassName)) {
				sheet.rules.styled.cache.add(composerClassName)

				let index = sheet.rules.styled.group.cssRules.length

				for (const cssText of toCssRules(composerStyle, [`.${composerClassName}`], [], config)) {
					sheet.rules.styled.group.insertRule(cssText, index++)
				}
			}

			// apply composer variants
			for (const [variantClassName, variantMatches, variantStyles] of composerVariants) {
				let doesVariantMatch = true

				for (const name in variantMatches) {
					delete forwardProps[name]

					const comparedValue = comparedProps[name]

					if (typeof comparedValue === 'object' && comparedValue && doesVariantMatch) {
						for (const bp in comparedValue) {
							if (comparedValue[bp] === variantMatches[name]) {
								doesVariantMatch = doesVariantMatch === true ? new Set : doesVariantMatch
								doesVariantMatch.add(config.media[bp.slice(1)] || bp)
							}
						}
						if (doesVariantMatch === true) doesVariantMatch = false
					} else {
						let propsPair = String(comparedValue)
						let matchPair = String(variantMatches[name])

						propsPair = propsPair === 'undefined' && !possibleVariants[name].has('undefined') ? defaultVariants[name] : propsPair

						if (propsPair !== matchPair) {
							doesVariantMatch = false
						}
					}
				}

				if (doesVariantMatch) {
					const customVariantClassName = doesVariantMatch === true ? variantClassName : `${variantClassName}-${createComponentId([ ...doesVariantMatch ])}`
					const customVariantStyles = doesVariantMatch === true ? variantStyles : [ ...doesVariantMatch ].reduce(
						(style, bp) => ({
							[bp.replace(/^[^@]/, '@media $&')]: style
						}),
						variantStyles
					)

					classSet.add(customVariantClassName)

					if (!sheet.rules.varied.cache.has(customVariantClassName)) {
						sheet.rules.varied.cache.add(customVariantClassName)

						let index = sheet.rules.varied.group.cssRules.length
						for (const cssText of toCssRules(customVariantStyles, [`.${customVariantClassName}`], [], config)) {
							sheet.rules.varied.group.insertRule(cssText, index++)
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
