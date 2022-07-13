import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';

import { ContactService } from '../features/contact/contact.service';

@Injectable()
export class ContactGuard implements CanActivate {
    constructor(@Inject(ContactService) private readonly _contactService: ContactService) {}

    async canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();

        const sessionUserId = req.session?.userId;
        if (!sessionUserId) return false;

        const contact = await this._contactService.getContact({ id: sessionUserId });

        return contact ? true : false;
    }
}
