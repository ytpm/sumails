import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Globe, Search } from 'lucide-react'
import { useState, useMemo } from 'react'

interface TimezoneSelectorProps {
	value: string
	onValueChange: (value: string) => void
}

export default function TimezoneSelector({ value, onValueChange }: TimezoneSelectorProps) {
	const [searchTerm, setSearchTerm] = useState('')

	const timezones = [
		{ value: "UTC", label: "UTC - Coordinated Universal Time" },
		
		// North America - US & Canada
		{ value: "America/St_Johns", label: "Newfoundland Time (NST) - St. John's" },
		{ value: "America/Halifax", label: "Atlantic Time (AST) - Halifax" },
		{ value: "America/New_York", label: "Eastern Time (EST/EDT) - New York" },
		{ value: "America/Toronto", label: "Eastern Time (EST/EDT) - Toronto" },
		{ value: "America/Detroit", label: "Eastern Time (EST/EDT) - Detroit" },
		{ value: "America/Chicago", label: "Central Time (CST/CDT) - Chicago" },
		{ value: "America/Winnipeg", label: "Central Time (CST/CDT) - Winnipeg" },
		{ value: "America/Denver", label: "Mountain Time (MST/MDT) - Denver" },
		{ value: "America/Edmonton", label: "Mountain Time (MST/MDT) - Edmonton" },
		{ value: "America/Phoenix", label: "Arizona Time (MST) - Phoenix" },
		{ value: "America/Los_Angeles", label: "Pacific Time (PST/PDT) - Los Angeles" },
		{ value: "America/Vancouver", label: "Pacific Time (PST/PDT) - Vancouver" },
		{ value: "America/Anchorage", label: "Alaska Time (AKST/AKDT) - Anchorage" },
		{ value: "Pacific/Honolulu", label: "Hawaii Time (HST) - Honolulu" },
		
		// Mexico & Central America
		{ value: "America/Mexico_City", label: "Central Time (CST/CDT) - Mexico City" },
		{ value: "America/Cancun", label: "Eastern Time (EST) - Cancun" },
		{ value: "America/Tijuana", label: "Pacific Time (PST/PDT) - Tijuana" },
		{ value: "America/Guatemala", label: "Central Time (CST) - Guatemala City" },
		{ value: "America/Tegucigalpa", label: "Central Time (CST) - Tegucigalpa" },
		{ value: "America/Costa_Rica", label: "Central Time (CST) - San José" },
		{ value: "America/Panama", label: "Eastern Time (EST) - Panama City" },
		
		// Caribbean
		{ value: "America/Havana", label: "Cuba Time (CST/CDT) - Havana" },
		{ value: "America/Jamaica", label: "Eastern Time (EST) - Kingston" },
		{ value: "America/Puerto_Rico", label: "Atlantic Time (AST) - San Juan" },
		{ value: "America/Barbados", label: "Atlantic Time (AST) - Bridgetown" },
		
		// South America
		{ value: "America/Bogota", label: "Colombia Time (COT) - Bogotá" },
		{ value: "America/Caracas", label: "Venezuela Time (VET) - Caracas" },
		{ value: "America/Guyana", label: "Guyana Time (GYT) - Georgetown" },
		{ value: "America/Suriname", label: "Suriname Time (SRT) - Paramaribo" },
		{ value: "America/Cayenne", label: "French Guiana Time (GFT) - Cayenne" },
		{ value: "America/Manaus", label: "Amazon Time (AMT) - Manaus" },
		{ value: "America/Sao_Paulo", label: "Brasília Time (BRT) - São Paulo" },
		{ value: "America/Rio_Branco", label: "Acre Time (ACT) - Rio Branco" },
		{ value: "America/Argentina/Buenos_Aires", label: "Argentina Time (ART) - Buenos Aires" },
		{ value: "America/Montevideo", label: "Uruguay Time (UYT) - Montevideo" },
		{ value: "America/Asuncion", label: "Paraguay Time (PYT) - Asunción" },
		{ value: "America/La_Paz", label: "Bolivia Time (BOT) - La Paz" },
		{ value: "America/Santiago", label: "Chile Time (CLT) - Santiago" },
		{ value: "America/Lima", label: "Peru Time (PET) - Lima" },
		{ value: "America/Guayaquil", label: "Ecuador Time (ECT) - Quito" },
		
		// Europe - Western
		{ value: "Europe/London", label: "Greenwich Mean Time (GMT/BST) - London" },
		{ value: "Europe/Dublin", label: "Irish Time (GMT/IST) - Dublin" },
		{ value: "Europe/Lisbon", label: "Western European Time (WET/WEST) - Lisbon" },
		{ value: "Atlantic/Reykjavik", label: "Greenwich Mean Time (GMT) - Reykjavik" },
		
		// Europe - Central
		{ value: "Europe/Paris", label: "Central European Time (CET/CEST) - Paris" },
		{ value: "Europe/Berlin", label: "Central European Time (CET/CEST) - Berlin" },
		{ value: "Europe/Amsterdam", label: "Central European Time (CET/CEST) - Amsterdam" },
		{ value: "Europe/Brussels", label: "Central European Time (CET/CEST) - Brussels" },
		{ value: "Europe/Madrid", label: "Central European Time (CET/CEST) - Madrid" },
		{ value: "Europe/Rome", label: "Central European Time (CET/CEST) - Rome" },
		{ value: "Europe/Milan", label: "Central European Time (CET/CEST) - Milan" },
		{ value: "Europe/Zurich", label: "Central European Time (CET/CEST) - Zurich" },
		{ value: "Europe/Vienna", label: "Central European Time (CET/CEST) - Vienna" },
		{ value: "Europe/Prague", label: "Central European Time (CET/CEST) - Prague" },
		{ value: "Europe/Budapest", label: "Central European Time (CET/CEST) - Budapest" },
		{ value: "Europe/Warsaw", label: "Central European Time (CET/CEST) - Warsaw" },
		{ value: "Europe/Stockholm", label: "Central European Time (CET/CEST) - Stockholm" },
		{ value: "Europe/Oslo", label: "Central European Time (CET/CEST) - Oslo" },
		{ value: "Europe/Copenhagen", label: "Central European Time (CET/CEST) - Copenhagen" },
		
		// Europe - Eastern
		{ value: "Europe/Helsinki", label: "Eastern European Time (EET/EEST) - Helsinki" },
		{ value: "Europe/Tallinn", label: "Eastern European Time (EET/EEST) - Tallinn" },
		{ value: "Europe/Riga", label: "Eastern European Time (EET/EEST) - Riga" },
		{ value: "Europe/Vilnius", label: "Eastern European Time (EET/EEST) - Vilnius" },
		{ value: "Europe/Athens", label: "Eastern European Time (EET/EEST) - Athens" },
		{ value: "Europe/Sofia", label: "Eastern European Time (EET/EEST) - Sofia" },
		{ value: "Europe/Bucharest", label: "Eastern European Time (EET/EEST) - Bucharest" },
		{ value: "Europe/Kiev", label: "Eastern European Time (EET/EEST) - Kyiv" },
		{ value: "Europe/Istanbul", label: "Turkey Time (TRT) - Istanbul" },
		{ value: "Europe/Moscow", label: "Moscow Time (MSK) - Moscow" },
		{ value: "Europe/Minsk", label: "Moscow Time (MSK) - Minsk" },
		
		// Africa
		{ value: "Africa/Casablanca", label: "Western European Time (WET) - Casablanca" },
		{ value: "Africa/Algiers", label: "Central European Time (CET) - Algiers" },
		{ value: "Africa/Tunis", label: "Central European Time (CET) - Tunis" },
		{ value: "Africa/Cairo", label: "Eastern European Time (EET) - Cairo" },
		{ value: "Africa/Lagos", label: "West Africa Time (WAT) - Lagos" },
		{ value: "Africa/Accra", label: "Greenwich Mean Time (GMT) - Accra" },
		{ value: "Africa/Dakar", label: "Greenwich Mean Time (GMT) - Dakar" },
		{ value: "Africa/Kinshasa", label: "West Africa Time (WAT) - Kinshasa" },
		{ value: "Africa/Luanda", label: "West Africa Time (WAT) - Luanda" },
		{ value: "Africa/Addis_Ababa", label: "East Africa Time (EAT) - Addis Ababa" },
		{ value: "Africa/Nairobi", label: "East Africa Time (EAT) - Nairobi" },
		{ value: "Africa/Dar_es_Salaam", label: "East Africa Time (EAT) - Dar es Salaam" },
		{ value: "Africa/Johannesburg", label: "South Africa Time (SAST) - Johannesburg" },
		{ value: "Africa/Cape_Town", label: "South Africa Time (SAST) - Cape Town" },
		
		// Middle East
		{ value: "Asia/Jerusalem", label: "Israel Time (IST/IDT) - Jerusalem" },
		{ value: "Asia/Beirut", label: "Eastern European Time (EET/EEST) - Beirut" },
		{ value: "Asia/Damascus", label: "Eastern European Time (EET/EEST) - Damascus" },
		{ value: "Asia/Amman", label: "Eastern European Time (EET/EEST) - Amman" },
		{ value: "Asia/Baghdad", label: "Arabia Standard Time (AST) - Baghdad" },
		{ value: "Asia/Kuwait", label: "Arabia Standard Time (AST) - Kuwait" },
		{ value: "Asia/Riyadh", label: "Arabia Standard Time (AST) - Riyadh" },
		{ value: "Asia/Qatar", label: "Arabia Standard Time (AST) - Doha" },
		{ value: "Asia/Dubai", label: "Gulf Standard Time (GST) - Dubai" },
		{ value: "Asia/Muscat", label: "Gulf Standard Time (GST) - Muscat" },
		{ value: "Asia/Tehran", label: "Iran Time (IRST/IRDT) - Tehran" },
		
		// Central Asia
		{ value: "Asia/Kabul", label: "Afghanistan Time (AFT) - Kabul" },
		{ value: "Asia/Karachi", label: "Pakistan Time (PKT) - Karachi" },
		{ value: "Asia/Kolkata", label: "India Time (IST) - Mumbai/Delhi" },
		{ value: "Asia/Kathmandu", label: "Nepal Time (NPT) - Kathmandu" },
		{ value: "Asia/Dhaka", label: "Bangladesh Time (BST) - Dhaka" },
		{ value: "Asia/Colombo", label: "Sri Lanka Time (SLST) - Colombo" },
		{ value: "Asia/Maldives", label: "Maldives Time (MVT) - Malé" },
		
		// Central Asia - Former Soviet
		{ value: "Asia/Yekaterinburg", label: "Yekaterinburg Time (YEKT) - Yekaterinburg" },
		{ value: "Asia/Omsk", label: "Omsk Time (OMST) - Omsk" },
		{ value: "Asia/Novosibirsk", label: "Novosibirsk Time (NOVT) - Novosibirsk" },
		{ value: "Asia/Krasnoyarsk", label: "Krasnoyarsk Time (KRAT) - Krasnoyarsk" },
		{ value: "Asia/Irkutsk", label: "Irkutsk Time (IRKT) - Irkutsk" },
		{ value: "Asia/Yakutsk", label: "Yakutsk Time (YAKT) - Yakutsk" },
		{ value: "Asia/Vladivostok", label: "Vladivostok Time (VLAT) - Vladivostok" },
		{ value: "Asia/Magadan", label: "Magadan Time (MAGT) - Magadan" },
		{ value: "Asia/Kamchatka", label: "Kamchatka Time (PETT) - Petropavlovsk" },
		{ value: "Asia/Anadyr", label: "Anadyr Time (ANAT) - Anadyr" },
		
		// Southeast Asia
		{ value: "Asia/Rangoon", label: "Myanmar Time (MMT) - Yangon" },
		{ value: "Asia/Bangkok", label: "Indochina Time (ICT) - Bangkok" },
		{ value: "Asia/Vientiane", label: "Indochina Time (ICT) - Vientiane" },
		{ value: "Asia/Phnom_Penh", label: "Indochina Time (ICT) - Phnom Penh" },
		{ value: "Asia/Ho_Chi_Minh", label: "Indochina Time (ICT) - Ho Chi Minh City" },
		{ value: "Asia/Jakarta", label: "Western Indonesia Time (WIB) - Jakarta" },
		{ value: "Asia/Makassar", label: "Central Indonesia Time (WITA) - Makassar" },
		{ value: "Asia/Jayapura", label: "Eastern Indonesia Time (WIT) - Jayapura" },
		{ value: "Asia/Singapore", label: "Singapore Time (SGT) - Singapore" },
		{ value: "Asia/Kuala_Lumpur", label: "Malaysia Time (MYT) - Kuala Lumpur" },
		{ value: "Asia/Brunei", label: "Brunei Time (BNT) - Bandar Seri Begawan" },
		{ value: "Asia/Manila", label: "Philippines Time (PHT) - Manila" },
		{ value: "Asia/Taipei", label: "Taiwan Time (TST) - Taipei" },
		
		// East Asia
		{ value: "Asia/Shanghai", label: "China Time (CST) - Beijing/Shanghai" },
		{ value: "Asia/Hong_Kong", label: "Hong Kong Time (HKT) - Hong Kong" },
		{ value: "Asia/Macau", label: "Macau Time (MOT) - Macau" },
		{ value: "Asia/Ulaanbaatar", label: "Ulaanbaatar Time (ULAT) - Ulaanbaatar" },
		{ value: "Asia/Tokyo", label: "Japan Time (JST) - Tokyo" },
		{ value: "Asia/Seoul", label: "Korea Time (KST) - Seoul" },
		{ value: "Asia/Pyongyang", label: "Korea Time (KST) - Pyongyang" },
		
		// Australia & New Zealand
		{ value: "Australia/Perth", label: "Australian Western Time (AWST) - Perth" },
		{ value: "Australia/Eucla", label: "Australian Central Western Time (ACWST) - Eucla" },
		{ value: "Australia/Darwin", label: "Australian Central Time (ACST) - Darwin" },
		{ value: "Australia/Adelaide", label: "Australian Central Time (ACST/ACDT) - Adelaide" },
		{ value: "Australia/Brisbane", label: "Australian Eastern Time (AEST) - Brisbane" },
		{ value: "Australia/Sydney", label: "Australian Eastern Time (AEST/AEDT) - Sydney" },
		{ value: "Australia/Melbourne", label: "Australian Eastern Time (AEST/AEDT) - Melbourne" },
		{ value: "Australia/Hobart", label: "Australian Eastern Time (AEST/AEDT) - Hobart" },
		{ value: "Australia/Lord_Howe", label: "Lord Howe Time (LHST/LHDT) - Lord Howe Island" },
		{ value: "Pacific/Auckland", label: "New Zealand Time (NZST/NZDT) - Auckland" },
		{ value: "Pacific/Chatham", label: "Chatham Time (CHAST/CHADT) - Chatham Islands" },
		
		// Pacific Islands
		{ value: "Pacific/Fiji", label: "Fiji Time (FJT) - Suva" },
		{ value: "Pacific/Tonga", label: "Tonga Time (TOT) - Nuku'alofa" },
		{ value: "Pacific/Samoa", label: "Samoa Time (SST) - Apia" },
		{ value: "Pacific/Tahiti", label: "Tahiti Time (TAHT) - Papeete" },
		{ value: "Pacific/Marquesas", label: "Marquesas Time (MART) - Marquesas" },
		{ value: "Pacific/Gambier", label: "Gambier Time (GAMT) - Gambier" },
		{ value: "Pacific/Pitcairn", label: "Pitcairn Time (PST) - Pitcairn" },
		{ value: "Pacific/Easter", label: "Easter Island Time (EAST/EASST) - Easter Island" },
		{ value: "Pacific/Galapagos", label: "Galápagos Time (GALT) - Galápagos" },
		{ value: "Pacific/Norfolk", label: "Norfolk Time (NFT) - Norfolk Island" },
		{ value: "Pacific/Kiritimati", label: "Line Islands Time (LINT) - Kiritimati" }
	]

	const filteredTimezones = useMemo(() => {
		if (!searchTerm) return timezones
		return timezones.filter(timezone => 
			timezone.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
			timezone.value.toLowerCase().includes(searchTerm.toLowerCase())
		)
	}, [searchTerm])

	return (
		<div className="space-y-2">
			<Label htmlFor="timezone" className="flex items-center gap-2">
				<Globe className="h-4 w-4" />
				Timezone
			</Label>
			<Select
				value={value}
				onValueChange={onValueChange}
			>
				<SelectTrigger>
					<SelectValue placeholder="Select timezone" />
				</SelectTrigger>
				<SelectContent className="max-h-60 overflow-y-auto">
					<div className="sticky top-0 z-10 bg-background p-2 border-b">
						<div className="relative">
							<Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search timezones..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-8 h-8 text-sm"
							/>
						</div>
					</div>
					{filteredTimezones.map((timezone) => (
						<SelectItem key={timezone.value} value={timezone.value} className="text-xs">
							{timezone.label}
						</SelectItem>
					))}
					{filteredTimezones.length === 0 && (
						<div className="p-4 text-center text-sm text-muted-foreground">
							No timezones found matching "{searchTerm}"
						</div>
					)}
				</SelectContent>
			</Select>
		</div>
	)
} 