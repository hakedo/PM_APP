import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { formatPhoneNumber } from '../../utils/formatters';

export function ClientFormFields({ client, onChange }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === 'state') {
      newValue = value.toUpperCase();
    } else if (name === 'phone') {
      newValue = formatPhoneNumber(value);
    }
    
    onChange({ ...client, [name]: newValue });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={client.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            name="lastName"
            value={client.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="middleInitial">Middle Initial</Label>
        <Input
          id="middleInitial"
          name="middleInitial"
          value={client.middleInitial}
          onChange={handleInputChange}
          maxLength={1}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          name="company"
          value={client.company}
          onChange={handleInputChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={client.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={client.phone}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          name="address"
          value={client.address}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unit/Suite</Label>
        <Input
          id="unit"
          name="unit"
          value={client.unit}
          onChange={handleInputChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            name="city"
            value={client.city}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            name="state"
            value={client.state}
            onChange={handleInputChange}
            maxLength={2}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip">ZIP *</Label>
          <Input
            id="zip"
            name="zip"
            value={client.zip}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
    </div>
  );
}
