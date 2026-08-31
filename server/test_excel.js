const rows = [{ 'S.No': 1, 'Participant Name': 'John', 'Club Name': 'Tech Club', 'Group Name': 'Group 1', 'Portfolio': 'Dev' }];

for (const row of rows) {
    const getVal = (keywords) => {
        const keys = Object.keys(row);
        
        // 1. Exact match (ignoring spaces/special chars)
        for (const kw of keywords) {
          const target = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
          const match = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === target);
          if (match) return row[match];
        }
        
        // 2. Exact word match
        for (const kw of keywords) {
          const cleanKwSpace = kw.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
          if (!cleanKwSpace) continue;
          const match = keys.find(k => {
            const cleanKeySpace = k.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
            return ` ${cleanKeySpace} `.includes(` ${cleanKwSpace} `);
          });
          if (match) return row[match];
        }
        
        // 3. Partial substring match
        for (const kw of keywords) {
          const target = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!target) continue;
          const match = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(target));
          if (match) return row[match];
        }
        
        return '';
      };

      const name = getVal(['name', 'participant']);
      const clubName = getVal(['club', 'institution', 'college', 'school', 'organization']);
      const groupRaw = getVal(['group', 'team']);
      const portfolio = getVal(['portfolio', 'designation', 'role', 'position']);
      const sNoRaw = getVal(['sno', 's no', 'sl no', 'serial', 'id']);
      
      console.log('name:', name);
      console.log('clubName:', clubName);
      console.log('group:', groupRaw);
      console.log('portfolio:', portfolio);
      console.log('sNoRaw:', sNoRaw);
}
