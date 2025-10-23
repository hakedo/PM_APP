import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';

export function MilestoneFormFields({ milestone, onChange, teamMembers = [] }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...milestone, [name]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Milestone Name *</Label>
        <Input
          id="name"
          name="name"
          value={milestone.name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="abbreviation">Abbreviation *</Label>
        <Input
          id="abbreviation"
          name="abbreviation"
          value={milestone.abbreviation}
          onChange={handleInputChange}
          maxLength={10}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={milestone.description}
          onChange={handleInputChange}
          rows={3}
        />
      </div>

      {teamMembers.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="teamMember">Assigned Team Member</Label>
          <select
            id="teamMember"
            name="teamMember"
            value={milestone.teamMember}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select team member</option>
            {teamMembers.map(member => (
              <option key={member._id} value={member._id}>
                {member.fullName}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
