// @flow
import {lang} from "../misc/LanguageViewModel.js"
import type {
	ContactAddressTypeEnum,
	ContactPhoneNumberTypeEnum,
	ContactSocialTypeEnum
} from "../api/common/TutanotaConstants"
import {ContactPhoneNumberType, ContactAddressType, ContactSocialType} from "../api/common/TutanotaConstants"
import {assertMainOrNode} from "../api/Env"
import {sortCompareByReverseId} from "../gui/base/List"

assertMainOrNode()

export const ContactMailAddressTypeToLabel: {[key: ContactAddressTypeEnum]:string} = {
	[ContactAddressType.PRIVATE]: "private_label",
	[ContactAddressType.WORK]: "work_label",
	[ContactAddressType.OTHER]: "other_label",
	[ContactAddressType.CUSTOM]: "custom_label"
}

export function getContactAddressTypeLabel(type: ContactAddressTypeEnum, custom: string) {
	if (type === ContactAddressType.CUSTOM) {
		return custom
	} else {
		return lang.get(ContactMailAddressTypeToLabel[type])
	}
}

export const ContactPhoneNumberTypeToLabel: {[key: ContactPhoneNumberTypeEnum]:string} = {
	[ContactPhoneNumberType.PRIVATE]: "private_label",
	[ContactPhoneNumberType.WORK]: "work_label",
	[ContactPhoneNumberType.MOBILE]: "mobile_label",
	[ContactPhoneNumberType.FAX]: "fax_label",
	[ContactPhoneNumberType.OTHER]: "other_label",
	[ContactPhoneNumberType.CUSTOM]: "custom_label"
}

export function getContactPhoneNumberTypeLabel(type: ContactPhoneNumberTypeEnum, custom: string) {
	if (type === ContactPhoneNumberType.CUSTOM) {
		return custom
	} else {
		return lang.get(ContactPhoneNumberTypeToLabel[type])
	}
}

export const ContactSocialTypeToLabel: {[key: ContactSocialTypeEnum]:string} = {
	[ContactSocialType.TWITTER]: "twitter_label",
	[ContactSocialType.FACEBOOK]: "facebook_label",
	[ContactSocialType.XING]: "xing_label",
	[ContactSocialType.LINKED_IN]: "linkedin_label",
	[ContactSocialType.OTHER]: "other_label",
	[ContactSocialType.CUSTOM]: "custom_label"
}

export function getContactSocialTypeLabel(type: ContactSocialTypeEnum, custom: string) {
	if (type == ContactSocialType.CUSTOM) {
		return custom
	} else {
		return lang.get(ContactSocialTypeToLabel[type])
	}
}

export function compareContacts(contact1: Contact, contact2: Contact) {
	let result = (contact1.firstName + " " + contact2.lastName).trim().localeCompare(contact2.firstName + " " + contact2.lastName)
	if (result == 0) {
		// see Multiselect with shift and up arrow not working properly #152 at github
		return sortCompareByReverseId(contact1, contact2)
	} else {
		return result
	}
}