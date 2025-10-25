import { useState } from 'react';
import { Users, UserPlus, Search, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { formatPhoneNumber } from '../../utils/formatters';

function ClientAssignmentSection({
  assignedClients,
  allClients,
  searchQuery,
  setSearchQuery,
  showClientSearch,
  setShowClientSearch,
  loadingClients,
  onAssignClient,
  onRemoveClient,
  // New client creation props
  isCreatingClient,
  setIsCreatingClient,
  newClient,
  onNewClientInputChange,
  onCreateClient,
  creatingClient,
  onCloseNewClientDialog
}) {
  const filteredClients = allClients.filter(client => {
    const isAlreadyAssigned = assignedClients.some(ac => ac._id === client._id);
    if (isAlreadyAssigned) return false;

    const searchLower = searchQuery.toLowerCase();
    return (
      client.fullName?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.company?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              Assigned Clients ({assignedClients.length})
            </div>
            <Button
              onClick={() => setShowClientSearch(true)}
              variant="outline"
              size="sm"
              className="gap-2 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <UserPlus className="w-4 h-4" />
              Assign Client
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No clients assigned yet
            </div>
          ) : (
            <div className="space-y-3">
              {assignedClients.map((assignment) => (
                <div
                  key={assignment._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 bg-gray-900">
                      <AvatarFallback className="text-white font-semibold">
                        {assignment.firstName?.[0]}{assignment.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {assignment.fullName}
                      </h4>
                      {assignment.company && (
                        <p className="text-sm text-gray-500">{assignment.company}</p>
                      )}
                      <p className="text-sm text-gray-600">{assignment.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveClient(assignment._id, assignment.fullName)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:scale-105 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Search Dialog */}
      <Dialog open={showClientSearch} onOpenChange={setShowClientSearch}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Assign Client to Project
            </DialogTitle>
            <DialogDescription>
              Search for a client to assign, or create a new one
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search clients by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {loadingClients ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredClients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No clients found matching your search' : 'No clients available'}
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <div
                      key={client._id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 bg-gray-900">
                          <AvatarFallback className="text-white text-xs">
                            {client.firstName?.[0]}{client.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{client.fullName}</div>
                          {client.company && (
                            <div className="text-sm text-gray-500">{client.company}</div>
                          )}
                          <div className="text-sm text-gray-600">{client.email}</div>
                        </div>
                      </div>
                      <Button
                        onClick={() => onAssignClient(client)}
                        size="sm"
                        className="shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        Assign
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowClientSearch(false);
                setSearchQuery('');
              }}
              className="shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowClientSearch(false);
                setIsCreatingClient(true);
              }}
              className="gap-2 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <UserPlus className="w-4 h-4" />
              Create New Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Client Dialog */}
      <Dialog open={isCreatingClient} onOpenChange={onCloseNewClientDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
            <DialogDescription>
              Add a new client and automatically assign them to this project
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onCreateClient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  value={newClient.company}
                  onChange={onNewClientInputChange}
                  placeholder="Company name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={newClient.firstName}
                  onChange={onNewClientInputChange}
                  placeholder="First name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleInitial">MI</Label>
                <Input
                  id="middleInitial"
                  name="middleInitial"
                  value={newClient.middleInitial}
                  onChange={onNewClientInputChange}
                  placeholder="MI"
                  maxLength={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={newClient.lastName}
                  onChange={onNewClientInputChange}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newClient.phone}
                  onChange={onNewClientInputChange}
                  placeholder="(XXX) XXX-XXXX"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newClient.email}
                  onChange={onNewClientInputChange}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={newClient.address}
                  onChange={onNewClientInputChange}
                  placeholder="Street address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  name="unit"
                  value={newClient.unit}
                  onChange={onNewClientInputChange}
                  placeholder="Apt/Unit"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={newClient.city}
                  onChange={onNewClientInputChange}
                  placeholder="City"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  value={newClient.state}
                  onChange={onNewClientInputChange}
                  placeholder="CA"
                  maxLength={2}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP *</Label>
                <Input
                  id="zip"
                  name="zip"
                  value={newClient.zip}
                  onChange={onNewClientInputChange}
                  placeholder="90210"
                  required
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCloseNewClientDialog}
                disabled={creatingClient}
                className="shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={creatingClient}
                className="shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {creatingClient ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create & Assign Client'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ClientAssignmentSection;
