'use client'

import { useState, useEffect, forwardRef, useRef } from 'react'
import { Input } from './input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Label } from './label'
import { cn } from '@/lib/utils'
import { CountryCode, findCountryByCode, countryCodes, searchCountries } from '@/data/country-codes'

// Format phone number for display: XXX-XXX-XXXX or XX-XXXX-XXXX depending on length
export const formatPhoneNumber = (value: string): string => {
	// Remove all non-digit characters
	const digits = value.replace(/\D/g, '')
	
	if (digits.length <= 6) {
		// Format as: XX-XXXX or XXX-XXX
		return digits.replace(/(\d{2,3})(\d{0,4})/, '$1-$2').replace(/-$/, '')
	} else {
		// Format as: XXX-XXX-XXXX or XX-XXXX-XXXX
		return digits
			.replace(/(\d{2,3})(\d{3,4})(\d{0,4})/, '$1-$2-$3')
			.replace(/-$/, '')
	}
}

// Strip formatting for database storage
export const stripPhoneFormatting = (value: string): string => {
	return value.replace(/\D/g, '')
}

// Format full phone number with country code
export const formatFullPhoneNumber = (countryCode: string, phoneNumber: string): string => {
	if (!phoneNumber) return ''
	
	// Extract just the numeric part of the country code (e.g., '1-US' -> '1')
	const numericCode = countryCode.split('-')[0]
	
	// Remove all non-digit characters from the phone number
	const cleanPhoneNumber = phoneNumber.replace(/\D/g, '')
	
	// Store with a separator between country code and phone number
	// Format: +{countryCode}-{phoneNumber}
	return `+${numericCode}-${cleanPhoneNumber}`
}

// Format phone number for display purposes only
export const formatPhoneNumberForDisplay = (countryCode: string, phoneNumber: string): string => {
	if (!phoneNumber) return ''
	const numericCode = countryCode.split('-')[0]
	return `+${numericCode} ${formatPhoneNumber(phoneNumber)}`
}

// Parse a full phone number to extract country code and phone number
export function parsePhoneNumber(fullNumber: string): { countryCode: string; phoneNumber: string } {
	if (!fullNumber) return { countryCode: '1', phoneNumber: '' }
	
	// Check if the number starts with a plus sign
	if (fullNumber.startsWith('+')) {
		// First, check if the number uses our new format with a hyphen separator: +972-0508855597
		const matchWithHyphen = fullNumber.match(/^\+(\d+)-(.+)$/)
		if (matchWithHyphen) {
			const numericCode = matchWithHyphen[1]
			const phoneNumber = matchWithHyphen[2]
			
			// Try to find a country with this code
			let countryCode = `${numericCode}`
			const country = findCountryByCode(countryCode)
			if (country) {
				countryCode = country.code.split('-')[0]
			} else if (numericCode === '1') {
				// Default to US for legacy data with just '1'
				countryCode = '1'
			}
			
			return { countryCode, phoneNumber }
		}
		
		// Next, try to match the format with a space after country code: +1 123-456-7890
		const matchWithSpace = fullNumber.match(/^\+(\d+)\s+(.+)$/)
		if (matchWithSpace) {
			const numericCode = matchWithSpace[1]
			const phoneNumber = matchWithSpace[2]
			
			// Try to find a country with this code
			let countryCode = `${numericCode}`
			const country = findCountryByCode(countryCode)
			if (country) {
				countryCode = country.code.split('-')[0]
			} else if (numericCode === '1') {
				// Default to US for legacy data with just '1'
				countryCode = '1'
			}
			
			return { countryCode, phoneNumber }
		}
		
		// If no space format, handle E.164 format: +11234567890
		// We need to identify the country code from the beginning of the number
		const numericPart = fullNumber.substring(1) // Remove the + sign
		
		// Try to find the country code by checking common country codes
		// This is a simplified approach - a more robust solution would use a library
		// Common country codes are 1-3 digits
		let countryCode = '1' // Default
		let phoneNumber = numericPart
		
		// Try to match known country codes (1, 2, or 3 digits)
		for (let i = 1; i <= 3; i++) {
			if (numericPart.length > i) {
				const potentialCode = numericPart.substring(0, i)
				const country = findCountryByCode(potentialCode)
				if (country) {
					countryCode = country.code.split('-')[0]
					phoneNumber = numericPart.substring(i)
					break
				}
			}
		}
		
		// If we couldn't find a match but the number starts with 1, assume US
		if (countryCode === '1' && numericPart.startsWith('1') && numericPart.length > 1) {
			phoneNumber = numericPart.substring(1)
		}
		
		return { countryCode, phoneNumber }
	}
	
	// If no match or doesn't start with +, return the full string as the phone number
	return { countryCode: '1', phoneNumber: fullNumber }
}

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
	value: string
	onChange: (value: string) => void
	error?: string
	label?: string
	className?: string
}

/**
 * PhoneInput component with country code selection
 * 
 * Provides a phone input with a country code selector and automatic formatting.
 * The phone number is automatically formatted as the user types and stored
 * in E.164-like format with country code.
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
	({ value, onChange, className, error, label, ...props }, ref) => {
		const [countryCode, setCountryCode] = useState('1')
		const [formattedValue, setFormattedValue] = useState('')
		const [rawPhoneNumber, setRawPhoneNumber] = useState('')
		const [isInputFocused, setIsInputFocused] = useState(false)
		const [searchQuery, setSearchQuery] = useState('')
		
		// Filter countries based on search query
		const filteredCountries = searchCountries(searchQuery)
		
		// Parse initial phone number
		useEffect(() => {
			if (value) {
				const parsed = parsePhoneNumber(value)
				setCountryCode(parsed.countryCode)
				setRawPhoneNumber(parsed.phoneNumber)
				setFormattedValue(formatPhoneNumber(parsed.phoneNumber))
			} else {
				// When value is empty, only clear the phone number fields
				// Keep the user's selected country code
				setRawPhoneNumber('')
				setFormattedValue('')
			}
		}, [value])

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const inputValue = e.target.value
			// Remove all non-numeric characters for the raw value
			const numericValue = inputValue.replace(/\D/g, '')
			
			setRawPhoneNumber(numericValue)
			setFormattedValue(formatPhoneNumber(numericValue))
			
			// Format full phone number for storage
			if (numericValue) {
				const fullPhoneNumber = formatFullPhoneNumber(countryCode, numericValue)
				onChange(fullPhoneNumber)
			} else {
				// When phone number is empty, pass empty string but keep country code selected
				onChange('')
			}
		}

		const handleCountryCodeChange = (newCountryCode: string) => {
			setCountryCode(newCountryCode)
			setSearchQuery('') // Clear search when selection is made
			if (rawPhoneNumber) {
				const fullPhoneNumber = formatFullPhoneNumber(newCountryCode, rawPhoneNumber)
				onChange(fullPhoneNumber)
			} else {
				// If no phone number, still update the parent with empty string
				// This ensures the parent component knows the country code changed
				onChange('')
			}
		}

		// Find the selected country
		const selectedCountry = findCountryByCode(countryCode) || 
			countryCodes.find(c => c.code.startsWith('1')) || 
			countryCodes[0]

		return (
			<div className="w-full">
				{label && (
					<Label className="block text-sm font-medium mb-1">
						{label}
					</Label>
				)}
				<div className="flex">
					<Select value={countryCode} onValueChange={handleCountryCodeChange}>
						<SelectTrigger className={cn(
							"w-[90px] h-10 rounded-r-none border-r-1",
							isInputFocused ? "border-ring" : "border-input"
						)}>
							<div className="flex items-center gap-1.5">
								<span className="text-sm">{selectedCountry.flag}</span>
								<span className="font-medium text-sm">+{countryCode}</span>
							</div>
						</SelectTrigger>
						<SelectContent className="max-h-[300px] w-[320px] overflow-hidden">
							<div className="sticky top-0 bg-background border-b p-2">
								<Input
									placeholder="Search countries..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="h-8"
								/>
							</div>
							<div className="max-h-[250px] overflow-y-auto">
								{filteredCountries.map((country) => (
									<SelectItem key={`${country.code}-${country.name}`} value={country.code.split('-')[0]}>
										<div className="flex items-center gap-2 min-w-0">
											<span className="flex-shrink-0">{country.flag}</span>
											<span className="font-medium w-10 flex-shrink-0">+{country.code.split('-')[0]}</span>
											<span className="text-sm text-muted-foreground truncate">
												{country.name}
											</span>
										</div>
									</SelectItem>
								))}
							</div>
						</SelectContent>
					</Select>
					<Input
						ref={ref}
						type="tel"
						value={formattedValue}
						onChange={handleInputChange}
						onFocus={() => setIsInputFocused(true)}
						onBlur={() => setIsInputFocused(false)}
						className={cn(
							"rounded-l-none flex-1 h-10 border-l-0",
							"focus-visible:ring-0 focus-visible:ring-offset-0",
							isInputFocused ? "border-ring" : "border-input",
							error && "border-red-500",
							className
						)}
						placeholder="123-456-7890"
						{...props}
					/>
				</div>
				{error && (
					<p className="mt-1 text-sm text-destructive">{error}</p>
				)}
				{rawPhoneNumber && !error && (
					<p className="mt-1 text-xs text-muted-foreground">
						Full format: +{countryCode} {formattedValue}
					</p>
				)}
			</div>
		)
	}
)

PhoneInput.displayName = 'PhoneInput' 