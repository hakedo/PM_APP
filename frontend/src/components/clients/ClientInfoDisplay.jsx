import { Input } from '../ui/input';
import { InfoField } from '../ui/info-field';
import { Users, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { formatPhoneNumber } from '../../utils/formatters';

export function ClientInfoDisplay({ 
  client, 
  isEditing, 
  editedClient, 
  onInputChange 
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === 'state') {
      newValue = value.toUpperCase();
    } else if (name === 'phone') {
      newValue = formatPhoneNumber(value);
    }
    
    onInputChange({ ...editedClient, [name]: newValue });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Name Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Name</h3>
        </div>
        {isEditing ? (
          <div className="space-y-2 pl-7">
            <Input
              name="firstName"
              value={editedClient.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="border-gray-300"
            />
            <Input
              name="middleInitial"
              value={editedClient.middleInitial}
              onChange={handleChange}
              placeholder="M.I."
              maxLength={1}
              className="border-gray-300"
            />
            <Input
              name="lastName"
              value={editedClient.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="border-gray-300"
            />
          </div>
        ) : (
          <p className="text-gray-900 font-medium pl-7">{client.fullName}</p>
        )}
      </div>

      <InfoField
        icon={Building2}
        label="Company"
        value={client.company}
        isEditing={isEditing}
        name="company"
        editValue={editedClient?.company || ''}
        onChange={handleChange}
        placeholder="Company name"
      />

      <InfoField
        icon={Mail}
        label="Email"
        value={client.email}
        isEditing={isEditing}
        name="email"
        editValue={editedClient?.email || ''}
        onChange={handleChange}
        type="email"
        placeholder="email@example.com"
      />

      <InfoField
        icon={Phone}
        label="Phone"
        value={client.phone}
        isEditing={isEditing}
        name="phone"
        editValue={editedClient?.phone || ''}
        onChange={handleChange}
        type="tel"
        placeholder="(555) 123-4567"
      />

      {/* Address Section */}
      <div className="space-y-2 lg:col-span-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Address</h3>
        </div>
        {isEditing ? (
          <div className="space-y-2 pl-7">
            <Input
              name="address"
              value={editedClient.address}
              onChange={handleChange}
              placeholder="Street Address"
              className="border-gray-300"
            />
            <Input
              name="unit"
              value={editedClient.unit}
              onChange={handleChange}
              placeholder="Unit/Suite"
              className="border-gray-300"
            />
            <div className="grid grid-cols-12 gap-2">
              <Input
                name="city"
                value={editedClient.city}
                onChange={handleChange}
                placeholder="City"
                className="col-span-6 border-gray-300"
              />
              <Input
                name="state"
                value={editedClient.state}
                onChange={handleChange}
                placeholder="ST"
                maxLength={2}
                className="col-span-2 border-gray-300 uppercase"
              />
              <Input
                name="zip"
                value={editedClient.zip}
                onChange={handleChange}
                placeholder="ZIP"
                className="col-span-4 border-gray-300"
              />
            </div>
          </div>
        ) : (
          <div className="text-gray-900 font-medium pl-7">
            <p>{client.address}</p>
            {client.unit && <p>{client.unit}</p>}
            <p>
              {client.city}, {client.state} {client.zip}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
