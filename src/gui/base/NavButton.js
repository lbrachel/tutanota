// @flow
import m from "mithril"
import {handleUncaughtError} from "../../misc/ErrorHandler"
import {lang} from "../../misc/LanguageViewModel"
import {size} from "../size"
import {removeFlash, addFlash} from "./Flash"
import {neverNull} from "../../api/common/utils/Utils"
import {Icon} from "./Icon"
import {theme} from "../theme"
import {styles} from "../styles"

const TRUE_CLOSURE = (): lazy<boolean> => true

export class NavButton {
	icon: lazy<SVG>;
	href: string|lazy<string>;
	clickHandler: ?clickHandler;

	isVisible: lazy<boolean>;
	isSelected: lazy<boolean>;
	_isSelectedPrefix: ?string;
	getLabel: lazy<string>;
	_domButton: HTMLElement;
	view: Function;
	_draggedOver: boolean;
	_dropHandler: ?dropHandler;
	_dropCounter: number; // we also get drag enter/leave events from subelements, so we need to count to know when the drag leaves this button
	_colors: NavButtonColorEnum;
	_hideLabel: boolean;


	constructor(label: string|lazy<string>, icon: lazy<SVG>, href: string|Function, isSelectedPrefix: ?string) {
		this._hideLabel = false
		this.icon = icon
		this.href = href
		this.clickHandler = null
		this._isSelectedPrefix = isSelectedPrefix
		this._colors = NavButtonColors.Header
		this.isVisible = TRUE_CLOSURE
		this._draggedOver = false
		this.isSelected = () => {
			if (this._isSelectedPrefix) {
				let current = m.route.get()
				return this._isSelectedPrefix && (current == this._isSelectedPrefix || (current.indexOf(this._isSelectedPrefix + "/") === 0))
			}
			return false
		}
		this.getLabel = label instanceof Function ? label : lang.get.bind(lang, label)

		this._dropCounter = 0

		this.view = (): VirtualElement => {
			// allow nav button without label for registration button on mobile devices
			return m("a.nav-button.noselect.flex-start.flex-no-shrink.items-center.click.plr-button.no-text-decoration.button-height", this.createButtonAttributes(), [
				this.icon() ? m(Icon, {
						icon: this.icon(),
						class: this._getIconClass(),
						style: {
							fill: (this.isSelected() || this._draggedOver) ? getColors(this._colors).button_selected : getColors(this._colors).button,
							"margin-top": (this._hideLabel) ? "0px" : "-2px"
						}
					}) : null,
				(!this._hideLabel) ? m("span.label.click.text-ellipsis.pl-m.b", this.getLabel()) : null
			])
		}
	}

	hideLabel(): NavButton {
		this._hideLabel = true
		return this
	}

	_getIconClass() {
		if (this._colors == NavButtonColors.Header && !styles.isDesktopLayout()) {
			return "flex-end items-center icon-xl" + (this.isSelected() ? " selected" : "")
		} else {
			return "flex-center items-center icon-large" + (this.isSelected() ? " selected" : "")
		}
	}

	_getUrl(): string {
		return (this.href instanceof Function) ? this.href() : this.href
	}

	_isExternalUrl() {
		let url = this._getUrl()
		return url != null ? url.indexOf("http") == 0 : false
	}

	createButtonAttributes() {
		let attr: any = {
			href: this._getUrl(),
			style: {color: (this.isSelected() || this._draggedOver) ? getColors(this._colors).button_selected : getColors(this._colors).button},
			title: this.getLabel(),
			target: this._isExternalUrl() ? "_blank" : undefined,
			oncreate: (vnode: VirtualElement) => {
				this._domButton = vnode.dom
				// route.link adds the appropriate prefix to the href attribute and sets the domButton.onclick handler
				if (!this._isExternalUrl()) {
					m.route.link(vnode)
				}
				this._domButton.onclick = (event: MouseEvent) => this.click(event)
				addFlash(vnode.dom)
			},
			onupdate: (vnode: VirtualElement) => {
				if (this.href instanceof Function) {
					if (!this._isExternalUrl()) {
						m.route.link(vnode)
					}
					this._domButton.onclick = (event: MouseEvent) => this.click(event)
				}
			},
			onbeforeremove: (vnode) => {
				removeFlash(vnode.dom)
			}
		}
		if (this._dropHandler) {
			attr.ondragenter = (ev) => {
				this._dropCounter++
				this._draggedOver = true
				ev.preventDefault()
			}
			attr.ondragleave = (ev) => {
				this._dropCounter--
				if (this._dropCounter == 0) {
					this._draggedOver = false
				}
				ev.preventDefault()
			}
			attr.ondragover = (ev) => {
				// needed to allow dropping
				ev.preventDefault()
			}
			attr.ondrop = (ev) => {
				this._dropCounter = 0
				this._draggedOver = false
				ev.preventDefault()
				if (ev.dataTransfer.getData("text")) {
					neverNull(this._dropHandler)(ev.dataTransfer.getData("text"))
				}
			}
		}
		return attr
	}

	setColors(colors: NavButtonColorEnum): NavButton {
		this._colors = colors
		return this
	}

	setClickHandler(clickHandler: clickHandler): NavButton {
		this.clickHandler = clickHandler
		return this
	}

	setIsVisibleHandler(clickHandler: clickHandler): NavButton {
		this.isVisible = clickHandler
		return this
	}

	setDropHandler(dropHandler: dropHandler): NavButton {
		this._dropHandler = dropHandler
		return this
	}

	click(event: MouseEvent) {
		if (!this._isExternalUrl()) {
			m.route.set(this._getUrl())
			try {
				if (this.clickHandler != null) {
					this.clickHandler(event)
				}
				// in IE the activeElement might not be defined and blur might not exist
				if (document.activeElement && document.activeElement.blur instanceof Function) {
					document.activeElement.blur()
				}
				event.preventDefault()
			} catch (e) {
				handleUncaughtError(e)
			}
		}
	}

	getHeight(): number {
		return size.button_height
	}
}

export const NavButtonColors = {
	Header: 'header',
	Nav: 'nav',
	Content: 'content',
}
type NavButtonColorEnum = $Values<typeof NavButtonColors>;

function getColors(buttonColors: NavButtonColorEnum) {
	switch (buttonColors) {
		case NavButtonColors.Header:
			return {
				button: styles.isDesktopLayout() ? theme.header_button : theme.content_accent,
				button_selected: styles.isDesktopLayout() ? theme.header_button_selected : theme.content_accent,
			}
		case NavButtonColors.Nav:
			return {
				button: theme.navigation_button,
				button_selected: theme.navigation_button_selected,
			}
		default:
			// for nav buttons in the more dropdown menu
			return {
				button: theme.content_button,
				button_selected: theme.content_button_selected,
			}
	}
}